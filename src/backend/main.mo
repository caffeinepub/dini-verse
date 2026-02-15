import Array "mo:core/Array";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type Category = {
    #adventure;
    #roleplay;
    #simulator;
  };

  public type DiniVerseUser = {
    displayName : Text;
    avatar : ?Storage.ExternalBlob;
  };

  public type Experience = {
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
      let exp1Popularity = exp1.playerCount + exp1.thumbsUp - exp1.thumbsDown;
      let exp2Popularity = exp2.playerCount + exp2.thumbsUp - exp2.thumbsDown;
      Nat.compare(exp2Popularity, exp1Popularity);
    };
  };

  let users = Map.empty<Principal, DiniVerseUser>();
  let experiences = Map.empty<Text, Experience>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  public shared ({ caller }) func signUp(displayName : Text, avatar : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can sign up");
    };

    switch (users.get(caller)) {
      case (?_) { Runtime.trap("User profile already exists") };
      case (null) {
        let user : DiniVerseUser = {
          displayName;
          avatar;
        };
        users.add(caller, user);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?DiniVerseUser {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their profile");
    };
    users.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : DiniVerseUser) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  public query ({ caller }) func getCurrentUserProfile() : async ?DiniVerseUser {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their profile");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?DiniVerseUser {
    // Public access - anyone can view user profiles
    users.get(user);
  };

  public shared ({ caller }) func createExperience(
    title : Text,
    description : Text,
    thumbnail : ?Storage.ExternalBlob,
    category : Category,
    gameplayControls : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create experiences");
    };

    let id = title.concat(description);
    let experience : Experience = {
      id;
      title;
      description;
      thumbnail;
      author = caller;
      category;
      playerCount = 0;
      thumbsUp = 0;
      thumbsDown = 0;
      gameplayControls;
    };
    experiences.add(id, experience);
    id;
  };

  public query ({ caller }) func getExperience(id : Text) : async ?Experience {
    // Public access - anyone can view experiences
    experiences.get(id);
  };

  public query ({ caller }) func getAllExperiences() : async [Experience] {
    // Public access - anyone can browse experiences
    experiences.values().toArray().sort(Experience.compareByTitle);
  };

  public query ({ caller }) func getExperiencesByAuthor(author : Principal) : async [Experience] {
    // Public access - anyone can browse experiences by author
    experiences.values().filter(
      func(exp) { exp.author == author }
    ).toArray();
  };

  public query ({ caller }) func searchExperiences(searchTerm : Text) : async [Experience] {
    // Public access - anyone can search experiences
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
    // Public access - anyone can browse experiences by category
    experiences.values().filter(
      func(exp) { exp.category == category }
    ).toArray();
  };

  public query ({ caller }) func getTrendingExperiences(category : Category) : async [Experience] {
    // Public access - anyone can view trending experiences
    let allExperiences = experiences.values().toArray();
    let filtered = allExperiences.filter(
      func(exp) { exp.category == category }
    );
    filtered.sort(Experience.compareByPopularity);
  };

  public shared ({ caller }) func incrementPlayerCount(experienceId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can increment player count");
    };

    switch (experiences.get(experienceId)) {
      case (null) { Runtime.trap("Experience not found") };
      case (?exp) {
        let updated : Experience = {
          exp with playerCount = exp.playerCount + 1;
        };
        experiences.add(experienceId, updated);
      };
    };
  };

  public shared ({ caller }) func rateExperience(experienceId : Text, isThumbsUp : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can rate experiences");
    };

    switch (experiences.get(experienceId)) {
      case (null) { Runtime.trap("Experience not found") };
      case (?exp) {
        let updated : Experience = {
          exp with thumbsUp = exp.thumbsUp + (if (isThumbsUp) { 1 } else { 0 });
          thumbsDown = exp.thumbsDown + (if (isThumbsUp) { 0 } else { 1 });
        };
        experiences.add(experienceId, updated);
      };
    };
  };

  public query ({ caller }) func getGameplayControls(experienceId : Text) : async Text {
    // Public access - anyone can view gameplay controls
    switch (experiences.get(experienceId)) {
      case (null) { Runtime.trap("Experience not found") };
      case (?exp) { exp.gameplayControls };
    };
  };
};
