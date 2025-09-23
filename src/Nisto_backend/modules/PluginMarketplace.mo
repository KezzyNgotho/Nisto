import Principal "mo:base/Principal";
import Time "mo:base/Time";

module {
  public type Plugin = {
    id : Nat;
    name : Text;
    description : Text;
    category : Text;
    author : Text;
    version : Text;
    rating : Float;
    downloads : Nat;
    size : Text;
    price : Nat;
    tags : [Text];
    features : [Text];
    status : Text;
    icon : Text;
    screenshots : [Text];
    reviews : [Review];
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type Review = {
    user : Principal;
    rating : Nat8;
    comment : Text;
    createdAt : Time.Time;
  };

  public type UserPluginState = {
    installed : [Nat];
  };

  public type UserPluginEntry = {
    user : Principal;
    state : UserPluginState;
  };
};
