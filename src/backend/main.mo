import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Time "mo:core/Time";

actor {
  // ── Stable variable preserved for backward compatibility ──
  // Previously used by the authorization mixin; kept here so the
  // stable type check does not reject the upgrade.
  type _OldUserRole = { #admin; #guest; #user };
  stable var accessControlState = {  // keep name to match previous stable state
    var adminAssigned = false;
    userRoles = Map.empty<Principal, _OldUserRole>();
  };
  // ── End backward-compat ──

  type Gender = { #male; #female; #other };
  type Language = {
    #en;
    #es;
    #fr;
    #pt;
    #de;
    #tr;
    #ru;
    #vi;
    #ko;
    #nl;
  };
  type TextDirection = { #leftToRight; #rightToLeft };

  type UserProfile = {
    displayName : Text;
    avatar : ?(Blob);
    visibility : { #online; #offline };
    gender : Gender;
    language : Language;
    nativeLanguage : Language;
    languageCode : Text;
    languagePrefix : Text;
    textDirection : TextDirection;
  };

  type UserSettings = {
    username : Text;
    displayName : Text;
    visibility : { #online; #offline };
    avatar : ?(Blob);
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

  type Category = {
    #adventure;
    #roleplay;
    #simulator;
  };

  type Experience = {
    id : Text;
    title : Text;
    description : Text;
    thumbnail : ?(Blob);
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

  let experiences = Map.empty<Text, Experience>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userSettings = Map.empty<Principal, UserSettings>();

  public query func getAllExperiences() : async [Experience] {
    experiences.values().toArray().sort(Experience.compareByTitle);
  };

  public query func getExperiencesByAuthor(author : Principal) : async [Experience] {
    experiences.values().filter(
      func(exp) { exp.author == author }
    ).toArray();
  };

  public query func searchExperiences(searchTerm : Text) : async [Experience] {
    if (searchTerm.size() == 0) {
      return experiences.values().toArray();
    };
    experiences.values().filter(
      func(exp) {
        exp.title.toLower().contains(#text(searchTerm.toLower())) or exp.description.toLower().contains(#text(searchTerm.toLower()));
      }
    ).toArray();
  };

  public query func getExperiencesByCategory(category : Category) : async [Experience] {
    experiences.values().filter(
      func(exp) { exp.category == category }
    ).toArray();
  };

  public query func getTrendingExperiences(category : Category) : async [Experience] {
    let filtered = experiences.values().filter(
      func(exp) { exp.category == category }
    ).toArray();
    filtered.sort(Experience.compareByPopularity);
  };

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
      gender = #other;
      language = #en;
      languageCode = "en";
      languagePrefix = "en";
      textDirection = #leftToRight;
      nativeLanguage = #en;
      pronunciationLanguage = #en;
    };

    userSettings.add(caller, defaultSettings);

    let defaultProfile = {
      displayName = "Anonymous";
      avatar = null;
      visibility = #online;
      gender = #other;
      language = #en;
      languageCode = "en";
      languagePrefix = "en";
      textDirection = #leftToRight;
      nativeLanguage = #en;
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
    let updatedSettings = {
      settings with
      displayName = newDisplayName;
      lastDisplayNameChange = currentTime;
      updatedAt = currentTime;
    };
    userSettings.add(caller, updatedSettings);

    switch (userProfiles.get(caller)) {
      case (null) {
        userProfiles.add(caller, {
          displayName = newDisplayName;
          avatar = null;
          visibility = settings.visibility;
          gender = settings.gender;
          language = settings.language;
          languageCode = settings.languageCode;
          nativeLanguage = settings.nativeLanguage;
          languagePrefix = settings.languagePrefix;
          textDirection = settings.textDirection;
        });
      };
      case (?profile) {
        userProfiles.add(caller, { profile with displayName = newDisplayName });
      };
    };
  };

  public shared ({ caller }) func updateVisibility(visibility : { #online; #offline }) : async () {
    let currentTime = Time.now();
    let settings = getOrInitializeSettings(caller);
    userSettings.add(caller, { settings with visibility; updatedAt = currentTime });

    switch (userProfiles.get(caller)) {
      case (null) {};
      case (?profile) {
        userProfiles.add(caller, { profile with visibility });
      };
    };
  };

  public shared ({ caller }) func deleteAccount() : async () {
    userProfiles.remove(caller);
    userSettings.remove(caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func setGender(gender : Gender) : async () {
    let settings = getOrInitializeSettings(caller);
    userSettings.add(caller, { settings with gender; updatedAt = Time.now() });

    switch (userProfiles.get(caller)) {
      case (null) {};
      case (?profile) {
        userProfiles.add(caller, { profile with gender });
      };
    };
  };

  public shared ({ caller }) func setLanguage(language : Language, languageCode : Text, languagePrefix : Text, textDirection : TextDirection, nativeLanguage : Language) : async () {
    let settings = getOrInitializeSettings(caller);
    userSettings.add(caller, {
      settings with
      language;
      languageCode;
      languagePrefix;
      textDirection;
      nativeLanguage;
      updatedAt = Time.now();
    });

    switch (userProfiles.get(caller)) {
      case (null) {};
      case (?profile) {
        userProfiles.add(caller, {
          profile with
          language;
          languageCode;
          languagePrefix;
          textDirection;
          nativeLanguage;
        });
      };
    };
  };
};
