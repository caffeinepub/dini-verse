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
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type PublicUserProfile = {
    displayName : Text;
    avatar : ?Storage.ExternalBlob;
    visibility : { #online; #offline };
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
  let userProfiles = Map.empty<Principal, PublicUserProfile>();
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
    };

    userSettings.add(caller, defaultSettings);

    let defaultProfile = {
      displayName = "Anonymous";
      avatar = null;
      visibility = #online;
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update display name");
    };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update display name and avatar");
    };

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
      lastDisplayNameChange = currentTime;
    };

    let existingProfile = userProfiles.get(caller);

    let updatedProfile = switch (existingProfile) {
      case (null) {
        {
          displayName = newDisplayName;
          avatar;
          visibility = settings.visibility;
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update visibility");
    };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete avatars");
    };

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

  public query ({ caller }) func getCallerUserProfile() : async ?PublicUserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : PublicUserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?PublicUserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
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
};
