import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Order "mo:core/Order";

import Time "mo:core/Time";
import List "mo:core/List";
import VarArray "mo:core/VarArray";
import Int "mo:core/Int";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  /////////////////////////////////////////////////////////////////////
  // Types
  /////////////////////////////////////////////////////////////////////

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

  public type FriendRequestStatus = {
    #pending;
    #accepted;
    #declined;
    #cancelled;
  };

  public type FriendRequest = {
    from : Principal;
    to : Principal;
    status : FriendRequestStatus;
  };

  public type Message = {
    id : Nat;
    sender : Principal;
    receiver : Principal;
    content : Text;
    timestamp : Time.Time;
    read : Bool;
  };

  public type MessageDto = {
    id : Nat;
    sender : Principal;
    receiver : Principal;
    content : Text;
    timestamp : Time.Time;
    read : Bool;
  };

  public type MessageInput = {
    receiver : Principal;
    content : Text;
  };

  /////////////////////////////////////////////////////////////////////
  // Storage
  /////////////////////////////////////////////////////////////////////
  let experiences = Map.empty<Text, Experience>();
  let friendships : Map.Map<Principal, Set.Set<Principal>> = Map.empty();
  let friendRequests = Map.empty<Principal, Set.Set<Principal>>();
  let messages = Map.empty<Principal, Map.Map<Principal, List.List<Message>>>();
  let userProfiles = Map.empty<Principal, DiniVerseUser>();

  /////////////////////////////////////////////////////////////////////
  // Experience Management
  /////////////////////////////////////////////////////////////////////

  public query ({ caller }) func getAllExperiences() : async [Experience] {
    // Anyone including guests can view experiences (read-only)
    experiences.values().toArray().sort(Experience.compareByTitle);
  };

  public query ({ caller }) func getExperiencesByAuthor(author : Principal) : async [Experience] {
    // Anyone including guests can view experiences (read-only)
    experiences.values().filter(
      func(exp) { exp.author == author }
    ).toArray();
  };

  public query ({ caller }) func searchExperiences(searchTerm : Text) : async [Experience] {
    // Anyone including guests can search experiences (read-only)
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
    // Anyone including guests can view experiences (read-only)
    experiences.values().filter(
      func(exp) { exp.category == category }
    ).toArray();
  };

  public query ({ caller }) func getTrendingExperiences(category : Category) : async [Experience] {
    // Anyone including guests can view experiences (read-only)
    let allExperiences = experiences.values().toArray();
    let filtered = allExperiences.filter(
      func(exp) { exp.category == category }
    );
    filtered.sort(Experience.compareByPopularity);
  };

  /////////////////////////////////////////////////////////////////////
  // User Profile Management (frontend requirement)
  /////////////////////////////////////////////////////////////////////
  public query ({ caller }) func getCallerUserProfile() : async ?DiniVerseUser {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get caller user profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?DiniVerseUser {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get user profiles");
    };
    userProfiles.get(user);
  };
};
