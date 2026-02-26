import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type Gender = { #male; #female };
  type TextDirection = { #leftToRight; #rightToLeft };

  type OldLanguage = { #german; #english };
  type NewLanguage = {
    #en; #es; #fr; #pt; #de; #tr; #ru; #vi; #ko; #nl
  };

  type OldUserProfile = {
    displayName : Text;
    avatar : ?Storage.ExternalBlob;
    visibility : { #online; #offline };
    gender : Gender;
    language : OldLanguage;
    nativeLanguage : OldLanguage;
    languageCode : Text;
    languagePrefix : Text;
    textDirection : TextDirection;
  };

  type NewUserProfile = {
    displayName : Text;
    avatar : ?Storage.ExternalBlob;
    visibility : { #online; #offline };
    gender : Gender;
    language : NewLanguage;
    nativeLanguage : NewLanguage;
    languageCode : Text;
    languagePrefix : Text;
    textDirection : TextDirection;
  };

  type OldUserSettings = {
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
    language : OldLanguage;
    pronunciationLanguage : OldLanguage;
    nativeLanguage : OldLanguage;
    languageCode : Text;
    languagePrefix : Text;
    textDirection : TextDirection;
  };

  type NewUserSettings = {
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
    language : NewLanguage;
    pronunciationLanguage : NewLanguage;
    nativeLanguage : NewLanguage;
    languageCode : Text;
    languagePrefix : Text;
    textDirection : TextDirection;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    userSettings : Map.Map<Principal, OldUserSettings>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    userSettings : Map.Map<Principal, NewUserSettings>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserSettings = old.userSettings.map<Principal, OldUserSettings, NewUserSettings>(
      func(_principal, settings) {
        {
          settings with
          language = convertLanguage(settings.language);
          pronunciationLanguage = convertLanguage(settings.pronunciationLanguage);
          nativeLanguage = convertLanguage(settings.nativeLanguage);
        };
      }
    );
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, profile) {
        {
          profile with
          language = convertLanguage(profile.language);
          nativeLanguage = convertLanguage(profile.nativeLanguage);
        };
      }
    );
    {
      userSettings = newUserSettings;
      userProfiles = newUserProfiles;
    };
  };

  func convertLanguage(oldLanguage : OldLanguage) : NewLanguage {
    switch (oldLanguage) {
      case (#german) { #de };
      case (#english) { #en };
    };
  };
};
