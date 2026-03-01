import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  // Old Gender type without #other
  type OldGender = { #male; #female };
  type OldLanguage = {
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
  type OldTextDirection = { #leftToRight; #rightToLeft };

  type OldUserProfile = {
    displayName : Text;
    avatar : ?Storage.ExternalBlob;
    visibility : { #online; #offline };
    gender : OldGender;
    language : OldLanguage;
    nativeLanguage : OldLanguage;
    languageCode : Text;
    languagePrefix : Text;
    textDirection : OldTextDirection;
  };

  type OldUserSettings = {
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
    gender : OldGender;
    language : OldLanguage;
    pronunciationLanguage : OldLanguage;
    nativeLanguage : OldLanguage;
    languageCode : Text;
    languagePrefix : Text;
    textDirection : OldTextDirection;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    userSettings : Map.Map<Principal, OldUserSettings>;
    // Other old state if needed
  };

  // New Gender type with #other
  type NewGender = { #male; #female; #other };
  type NewLanguage = OldLanguage;
  type NewTextDirection = OldTextDirection;

  type NewUserProfile = {
    displayName : Text;
    avatar : ?Storage.ExternalBlob;
    visibility : { #online; #offline };
    gender : NewGender;
    language : NewLanguage;
    nativeLanguage : NewLanguage;
    languageCode : Text;
    languagePrefix : Text;
    textDirection : NewTextDirection;
  };

  type NewUserSettings = {
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
    gender : NewGender;
    language : NewLanguage;
    pronunciationLanguage : NewLanguage;
    nativeLanguage : NewLanguage;
    languageCode : Text;
    languagePrefix : Text;
    textDirection : NewTextDirection;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    userSettings : Map.Map<Principal, NewUserSettings>;
    // Other new state if needed
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_p, oldProfile) {
        { oldProfile with gender = migrateGender(oldProfile.gender) };
      }
    );

    let newUserSettings = old.userSettings.map<Principal, OldUserSettings, NewUserSettings>(
      func(_p, oldSettings) {
        { oldSettings with gender = migrateGender(oldSettings.gender) };
      }
    );

    {
      userProfiles = newUserProfiles;
      userSettings = newUserSettings;
    };
  };

  // Helper function to convert OldGender to NewGender
  func migrateGender(oldGender : OldGender) : NewGender {
    switch (oldGender) {
      case (#male) { #male };
      case (#female) { #female };
    };
  };
};
