import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Time "mo:core/Time";
import List "mo:core/List";
import Int "mo:core/Int";

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

  let users = Map.empty<Principal, DiniVerseUser>();
  let experiences = Map.empty<Text, Experience>();

  let friendships : Map.Map<Principal, Set.Set<Principal>> = Map.empty();
  let friendRequests = Map.empty<Principal, Set.Set<Principal>>();
  let messages = Map.empty<Principal, Map.Map<Principal, List.List<Message>>>();

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
    experiences.get(id);
  };

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
    switch (experiences.get(experienceId)) {
      case (null) { Runtime.trap("Experience not found") };
      case (?exp) { exp.gameplayControls };
    };
  };

  public shared ({ caller }) func sendFriendRequest(target : Principal) : async FriendRequest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can send friend requests");
    };

    if (caller == target) {
      Runtime.trap("Cannot friend yourself");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?_) {
        let pendingRequest : FriendRequest = {
          from = caller;
          to = target;
          status = #pending;
        };

        let updatedRequests = switch (friendRequests.get(target)) {
          case (null) {
            let newSet = Set.empty<Principal>();
            newSet.add(caller);
            newSet;
          };
          case (?existing) {
            existing.add(caller);
            existing;
          };
        };
        friendRequests.add(target, updatedRequests);

        pendingRequest;
      };
    };
  };

  public shared ({ caller }) func respondToFriendRequest(from : Principal, action : { #accept; #decline }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can respond to requests");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?_) {
        switch (friendRequests.get(caller)) {
          case (null) { Runtime.trap("No pending requests") };
          case (?requests) {
            if (not requests.contains(from)) {
              Runtime.trap("No pending request from user");
            };

            switch (action) {
              case (#accept) {
                requests.remove(from);
                if (requests.size() > 0) {
                  friendRequests.add(caller, requests);
                } else {
                  friendRequests.remove(caller);
                };

                let currentFriends = switch (friendships.get(caller)) {
                  case (null) {
                    let newSet = Set.empty<Principal>();
                    newSet.add(from);
                    newSet;
                  };
                  case (?existing) {
                    existing.add(from);
                    existing;
                  };
                };
                friendships.add(caller, currentFriends);

                let currentFriendsFrom = switch (friendships.get(from)) {
                  case (null) {
                    let newSet = Set.empty<Principal>();
                    newSet.add(caller);
                    newSet;
                  };
                  case (?existing) {
                    existing.add(caller);
                    existing;
                  };
                };
                friendships.add(from, currentFriendsFrom);
              };
              case (#decline) {
                requests.remove(from);
                if (requests.size() > 0) {
                  friendRequests.add(caller, requests);
                } else {
                  friendRequests.remove(caller);
                };
              };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func unfriend(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can unfriend");
    };

    switch (friendships.get(caller)) {
      case (null) { Runtime.trap("No friends found") };
      case (?friends) {
        if (not friends.contains(target)) {
          Runtime.trap("Not friends with user");
        };

        friends.remove(target);
        if (friends.size() > 0) {
          friendships.add(caller, friends);
        } else {
          friendships.remove(caller);
        };

        switch (friendships.get(target)) {
          case (?targetFriends) {
            targetFriends.remove(caller);
            if (targetFriends.size() > 0) {
              friendships.add(target, targetFriends);
            } else {
              friendships.remove(target);
            };
          };
          case (null) {};
        };
      };
    };
  };

  public query ({ caller }) func getFriendsList() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view friends list");
    };

    switch (friendships.get(caller)) {
      case (null) { [] };
      case (?friends) { friends.toArray() };
    };
  };

  public query ({ caller }) func getPendingFriendRequests() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view friend requests");
    };

    switch (friendRequests.get(caller)) {
      case (null) { [] };
      case (?requests) { requests.toArray() };
    };
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

  public shared ({ caller }) func sendMessage(input : MessageInput) : async Message {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages");
    };

    let messageId = Time.now();

    let newMessage : Message = {
      id = messageId.toNat();
      sender = caller;
      receiver = input.receiver;
      content = input.content;
      timestamp = Time.now();
      read = false;
    };

    let existingMessages = switch (messages.get(caller)) {
      case (null) {
        let newMap = Map.empty<Principal, List.List<Message>>();
        newMap;
      };
      case (?entries) { entries };
    };

    let receiverMessages = switch (existingMessages.get(input.receiver)) {
      case (null) {
        let newList = List.empty<Message>();
        newList;
      };
      case (?entries) { entries };
    };

    receiverMessages.add(newMessage);

    existingMessages.add(input.receiver, receiverMessages);
    messages.add(caller, existingMessages);

    newMessage;
  };

  public query ({ caller }) func getMessages(receiver : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view messages");
    };

    switch (messages.get(caller)) {
      case (null) { [] };
      case (?entries) {
        switch (entries.get(receiver)) {
          case (null) { [] };
          case (?receiverMessages) {
            receiverMessages.toArray();
          };
        };
      };
    };
  };

  public query ({ caller }) func searchUsersByDisplayName(searchTerm : Text) : async [(Principal, DiniVerseUser)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can search for users");
    };

    if (searchTerm.size() == 0) {
      return users.toArray();
    };

    users.toArray().filter(
      func((_, user)) {
        user.displayName.toLower().contains(#text(searchTerm.toLower()));
      }
    );
  };
};
