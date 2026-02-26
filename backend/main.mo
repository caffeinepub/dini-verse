import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Order "mo:core/Order";
import List "mo:core/List";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";


actor {
  include MixinStorage();

  type Gender = { #male; #female };
  type Language = { #german; #english };
  type TextDirection = { #leftToRight; #rightToLeft };

  type UserProfile = {
    displayName : Text;
    avatar : ?Storage.ExternalBlob;
    visibility : { #online; #offline };
    gender : Gender;
    language : Language; // External representation
    nativeLanguage : Language;
    languageCode : Text; // ISO 639-1 code
    languagePrefix : Text; // e.g., "de", "en"
    textDirection : TextDirection;
  };

  type UserSettings = {
    username : Text;
    displayName : Text;
    visibility : { #online; #offline };
    avatar : ?Storage.ExternalBlob;
    lastUsernameChange : Time.Time;
    lastDisplayNameChange : Time.Time;
    lastPasswordChange : Time.Time;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    passwordResetAttempts : Nat;
    lastPasswordResetAttempt : Time.Time;
    gender : Gender;
    language : Language;
    pronunciationLanguage : Language;
    nativeLanguage : Language;
    languageCode : Text;
    languagePrefix : Text;
    textDirection : TextDirection;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Category = {
    #adventure;
    #roleplay;
    #simulator;
  };

  type Experience = {
    id : Text;
    title : Text;
    description : Text;
    thumbnail : ?Storage.ExternalBlob;
    author : Principal;
    category : Category;
    playerCount : Nat;
    thumbsUp : Nat;
    thumbsDown : Nat;
    gameplayControls : Text;
  };

  module Experience {
    public func compareByTitle(exp1 : Experience, exp2 : Experience) : Order.Order {
      Text.compare(exp1.title, exp2.title);
    };

    public func compareByPopularity(exp1 : Experience, exp2 : Experience) : Order.Order {
      Nat.compare(
        exp2.playerCount + exp2.thumbsUp - exp2.thumbsDown,
        exp1.playerCount + exp1.thumbsUp - exp1.thumbsDown,
      );
    };
  };

  type Visibility = {
    #online;
    #offline;
  };

  let experiences = Map.empty<Text, Experience>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userSettings = Map.empty<Principal, UserSettings>();

  public query ({ caller }) func getAllExperiences() : async [Experience] {
    experiences.values().toArray().sort(Experience.compareByTitle);
  };

  public query ({ caller }) func getExperiencesByAuthor(author : Principal) : async [Experience] {
    experiences.values().filter(
      func(exp) { exp.author == author }
    ).toArray();
  };

  public query ({ caller }) func searchExperiences(searchTerm : Text) : async [Experience] {
    if (searchTerm.size() == 0) {
      return experiences.values().toArray();
    };

    experiences.values().filter(
      func(exp) {
        exp.title.toLower().contains(#text(searchTerm.toLower())) or exp.description.toLower().contains(#text(searchTerm.toLower()));
      }
    ).toArray();
  };

  public query ({ caller }) func getExperiencesByCategory(category : Category) : async [Experience] {
    experiences.values().filter(
      func(exp) { exp.category == category }
    ).toArray();
  };

  public query ({ caller }) func getTrendingExperiences(category : Category) : async [Experience] {
    let filtered = experiences.values().filter(
      func(exp) { exp.category == category }
    ).toArray();
    filtered.sort(Experience.compareByPopularity);
  };

  public query ({ caller }) func getAllLanguageSettings() : async [(Principal, UserSettings)] {
    userSettings.toArray();
  };

  // Set default language and gender
  private func initializeDefaultSettings(caller : Principal) : UserSettings {
    let now = Time.now();
    let defaultSettings = {
      username = "";
      displayName = "Anonymous";
      visibility = #online;
      avatar = null;
      lastUsernameChange = now;
      lastDisplayNameChange = now;
      lastPasswordChange = now;
      createdAt = now;
      updatedAt = now;
      passwordResetAttempts = 0;
      lastPasswordResetAttempt = now;
      gender = #female;
      language = #german;
      languageCode = "de";
      languagePrefix = "de";
      textDirection = #leftToRight;
      nativeLanguage = #german;
      pronunciationLanguage = #german;
    };

    userSettings.add(caller, defaultSettings);

    let defaultProfile = {
      displayName = "Anonymous";
      avatar = null;
      visibility = #online;
      gender = #female;
      language = #german;
      languageCode = "de"; // Default to German
      languagePrefix = "de";
      textDirection = #leftToRight;
      nativeLanguage = #german;
    };
    userProfiles.add(caller, defaultProfile);

    defaultSettings;
  };

  private func getOrInitializeSettings(caller : Principal) : UserSettings {
    switch (userSettings.get(caller)) {
      case (?settings) { settings };
      case (null) { initializeDefaultSettings(caller) };
    };
  };

  public query ({ caller }) func getSettings() : async UserSettings {
    getOrInitializeSettings(caller);
  };

  public shared ({ caller }) func updateDisplayName(newDisplayName : Text) : async () {
    let currentTime = Time.now();
    let settings = getOrInitializeSettings(caller);

    let lastChangeTime = settings.lastDisplayNameChange;
    if (currentTime < lastChangeTime + 86400000000000) {
      Runtime.trap("Display name can only be changed once per day");
    };

    let updatedSettings = {
      settings with
      displayName = newDisplayName;
      lastDisplayNameChange = currentTime;
      updatedAt = currentTime;
    };

    let existingProfile = userProfiles.get(caller);

    let updatedProfile = switch (existingProfile) {
      case (null) {
        {
          displayName = newDisplayName;
          avatar = null;
          visibility = settings.visibility;
          gender = settings.gender;
          language = settings.language;
          languageCode = settings.languageCode;
          nativeLanguage = settings.nativeLanguage;
          languagePrefix = settings.languagePrefix;
          textDirection = settings.textDirection;
        };
      };
      case (?profile) {
        { profile with displayName = newDisplayName };
      };
    };

    userSettings.add(caller, updatedSettings);
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func updateDisplayNameAndAvatar(newDisplayName : Text, avatar : ?Storage.ExternalBlob) : async () {
    let currentTime = Time.now();
    let settings = getOrInitializeSettings(caller);

    let displayNameChanged = newDisplayName != settings.displayName;
    if (displayNameChanged and currentTime < settings.lastDisplayNameChange + 86400000000000) {
      Runtime.trap("Display name can only be changed once per day");
    };

    let updatedSettings = {
      settings with
      displayName = newDisplayName;
      avatar;
      lastDisplayNameChange = if (displayNameChanged) { currentTime } else { settings.lastDisplayNameChange };
      updatedAt = currentTime;
    };

    let existingProfile = userProfiles.get(caller);

    let updatedProfile = switch (existingProfile) {
      case (null) {
        {
          displayName = newDisplayName;
          avatar;
          visibility = settings.visibility;
          gender = settings.gender;
          language = settings.language;
          languageCode = settings.languageCode;
          nativeLanguage = settings.nativeLanguage;
          languagePrefix = settings.languagePrefix;
          textDirection = settings.textDirection;
        };
      };
      case (?profile) {
        { profile with displayName = newDisplayName; avatar };
      };
    };

    userSettings.add(caller, updatedSettings);
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func updateVisibility(visibility : Visibility) : async () {
    let currentTime = Time.now();
    let settings = getOrInitializeSettings(caller);

    let updatedSettings = {
      settings with
      visibility;
      updatedAt = currentTime;
    };

    let existingProfile = userProfiles.get(caller);

    let updatedProfile = switch (existingProfile) {
      case (null) {
        {
          displayName = settings.displayName;
          avatar = settings.avatar;
          visibility;
          gender = settings.gender;
          language = settings.language;
          languageCode = settings.languageCode;
          nativeLanguage = settings.nativeLanguage;
          languagePrefix = settings.languagePrefix;
          textDirection = settings.textDirection;
        };
      };
      case (?profile) {
        { profile with visibility };
      };
    };

    userSettings.add(caller, updatedSettings);
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func deleteAvatar() : async () {
    let settings = getOrInitializeSettings(caller);

    let updatedSettings = { settings with avatar = null };
    userSettings.add(caller, updatedSettings);

    switch (userProfiles.get(caller)) {
      case (null) {};
      case (?profile) {
        let updatedProfile = { profile with avatar = null };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func deleteAccount() : async () {
    // Remove user profile
    userProfiles.remove(caller);
    // Remove user settings
    userSettings.remove(caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(
    displayName : Text,
    avatar : ?Storage.ExternalBlob,
    visibility : { #online; #offline },
    gender : Gender,
    language : Language,
    languageCode : Text,
    languagePrefix : Text,
    textDirection : TextDirection,
    nativeLanguage : Language,
  ) : async () {
    let profile : UserProfile = {
      displayName;
      avatar;
      visibility;
      gender;
      language;
      languageCode;
      languagePrefix;
      textDirection;
      nativeLanguage;
    };
    userProfiles.add(caller, profile);

    // Also update settings to keep them in sync
    let currentTime = Time.now();
    let existingSettings = getOrInitializeSettings(caller);
    let updatedSettings = {
      existingSettings with
      displayName;
      avatar;
      visibility;
      gender;
      language;
      languageCode;
      languagePrefix;
      textDirection;
      nativeLanguage;
      updatedAt = currentTime;
    };
    userSettings.add(caller, updatedSettings);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) {
        switch (userSettings.get(user)) {
          case (null) { ?profile };
          case (?settings) {
            switch (settings.visibility) {
              case (#offline) {
                let profileWithOffline = {
                  profile with visibility = #offline;
                };
                ?profileWithOffline;
              };
              case (_) { ?profile };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func getGender() : async Gender {
    getOrInitializeSettings(caller).gender;
  };

  public shared ({ caller }) func setGender(gender : Gender) : async () {
    let settings = getOrInitializeSettings(caller);
    let updatedSettings = { settings with gender; updatedAt = Time.now() };
    userSettings.add(caller, updatedSettings);

    // Also update the profile (if exists) to keep it in sync
    switch (userProfiles.get(caller)) {
      case (null) {};
      case (?profile) {
        let updatedProfile = { profile with gender };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Retrieve full language settings, including code and prefix
  public shared ({ caller }) func getLanguageSettings() : async (Language, Text, Text, TextDirection, Language) {
    let settings = getOrInitializeSettings(caller);
    (settings.language, settings.languageCode, settings.languagePrefix, settings.textDirection, settings.nativeLanguage);
  };

  public shared ({ caller }) func setLanguage(language : Language, languageCode : Text, languagePrefix : Text, textDirection : TextDirection, nativeLanguage : Language) : async () {
    let settings = getOrInitializeSettings(caller);
    let updatedSettings = {
      settings with
      language;
      languageCode;
      languagePrefix;
      textDirection;
      nativeLanguage;
      updatedAt = Time.now();
    };
    userSettings.add(caller, updatedSettings);

    // Also update the profile (if exists) to keep it in sync
    switch (userProfiles.get(caller)) {
      case (null) {};
      case (?profile) {
        let updatedProfile = {
          profile with
          language;
          languageCode;
          languagePrefix;
          textDirection;
          nativeLanguage;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };
};
