import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Array "mo:base/Array";
import IC "ic:aaaaa-aa";

module {
  public func transform(input : TransformationInput) : TransformationOutput {
    let response = input.response;
    {
      response with headers = [];
    };
  };

  public type TransformationInput = {
    context : Blob;
    response : IC.http_request_result;
  };
  public type TransformationOutput = IC.http_request_result;
  public type Transform = query TransformationInput -> async TransformationOutput;
  public type Header = {
    name: Text;
    value: Text;
  };

  let httpRequestCycles = 231_000_000_000;

  public func httpGetRequest(url : Text, extraHeaders: [Header], transform : Transform) : async Text {
    let headers = Array.append(extraHeaders, [
      { name = "User-Agent"; value = "caffeine.ai" },
    ]);
    let http_request : IC.http_request_args = {
      url = url;
      max_response_bytes = null;
      headers;
      body = null;
      method = #get;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
      is_replicated = ?false;
    };
    let httpResponse = await (with cycles = httpRequestCycles) IC.http_request(http_request);
    switch (Text.decodeUtf8(httpResponse.body)) {
      case (null) { Debug.trap("empty HTTP response") };
      case (?decodedResponse) { decodedResponse };
    };
  };

  public func httpPostRequest(url : Text, extraHeaders: [Header], body : Text, transform : Transform) : async Text {
    let headers = Array.append(extraHeaders, [
      { name = "User-Agent"; value = "caffeine.ai" },
      { name = "Idempotency-Key"; value = "Time-" # Int.toText(Time.now()) },
    ]);
    let requestBody = Text.encodeUtf8(body);
    let httpRequest : IC.http_request_args = {
      url = url;
      max_response_bytes = null;
      headers;
      body = ?requestBody;
      method = #post;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
      is_replicated = ?false;
    };
    let httpResponse = await (with cycles = httpRequestCycles) IC.http_request(httpRequest);
    switch (Text.decodeUtf8(httpResponse.body)) {
      case (null) { Debug.trap("empty HTTP response") };
      case (?decodedResponse) { decodedResponse };
    };
  };
};
