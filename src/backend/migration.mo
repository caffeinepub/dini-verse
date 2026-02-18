import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Storage "blob-storage/Storage";

module {
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
    lastUsernameChange : Int;
    lastDisplayNameChange : Int;
    lastPasswordChange : Int;
    createdAt : Int;
    updatedAt : Int;
    passwordResetAttempts : Nat;
    lastPasswordResetAttempt : Int;
  };

  // Old actor with friendships, friendRequests, messages and experiences.
  type OldActor = {
    friendships : Map.Map<Principal, Set.Set<Principal>>;
    friendRequests : Map.Map<Principal, Set.Set<Principal>>;
    messages : Map.Map<Principal, Map.Map<Principal, List.List<{ id : Nat; sender : Principal; receiver : Principal; content : Text; timestamp : Int; read : Bool }>>>;
    experiences : Map.Map<Text, {
      id : Text;
      title : Text;
      description : Text;
      thumbnail : ?Storage.ExternalBlob;
      author : Principal;
      category : { #adventure; #roleplay; #simulator };
      playerCount : Nat;
      thumbsUp : Nat;
      thumbsDown : Nat;
      gameplayControls : Text;
    }>;
    userProfiles : Map.Map<Principal, PublicUserProfile>;
    userSettings : Map.Map<Principal, UserSettings>;
  };

  // New actor without the removed variables.
  type NewActor = {
    userProfiles : Map.Map<Principal, PublicUserProfile>;
    userSettings : Map.Map<Principal, UserSettings>;
  };

  public func run(old : OldActor) : NewActor {
    { userProfiles = old.userProfiles; userSettings = old.userSettings };
  };
};
