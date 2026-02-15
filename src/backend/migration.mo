import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Text "mo:core/Text";

module {
  type OldExperience = {
    id : Text;
    title : Text;
    description : Text;
    thumbnail : ?Storage.ExternalBlob;
    author : Principal;
  };

  type OldActor = {
    users : Map.Map<Principal, { displayName : Text; avatar : ?Storage.ExternalBlob }>;
    experiences : Map.Map<Text, OldExperience>;
  };

  type NewExperience = {
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
  };

  type NewActor = {
    users : Map.Map<Principal, { displayName : Text; avatar : ?Storage.ExternalBlob }>;
    experiences : Map.Map<Text, NewExperience>;
  };

  public func run(old : OldActor) : NewActor {
    let newExperiences = old.experiences.map<Text, OldExperience, NewExperience>(
      func(_id, oldExp) {
        {
          oldExp with
          category = #adventure;
          playerCount = 0;
          thumbsUp = 0;
          thumbsDown = 0;
          gameplayControls = "Use WASD to move, Space to jump, Mouse to control camera.\n";
        };
      }
    );
    { old with experiences = newExperiences };
  };
};
