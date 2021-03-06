'use strict';

describe('StreamdataEventSource.', function () {

  describe('CheckDecorateDecoratesURLs', function() {

      beforeEach(function() {
          delete streamdataio.Pk;
          delete streamdataio.pk;
      });

    it('should decorate a simple url with no params', function () {
      //GIVEN
      var e = new StreamdataEventSource("http://www.google.fr", "someRandomExtraLongDummyToken");
      var expectedConvertedUrl = "https://streamdata.motwin.net/http://www.google.fr/?X-Sd-Token=someRandomExtraLongDummyToken";
      var convertedUrl = e._decorate(e._url);

      expect(expectedConvertedUrl).toEqual(convertedUrl);
    });

    it('should decorate a url with params', function () {
      //GIVEN
      var e = new StreamdataEventSource("http://www.google.fr?toto=1",  "someRandomExtraLongDummyToken");
      var expectedConvertedUrl = "https://streamdata.motwin.net/http://www.google.fr/?toto=1&X-Sd-Token=someRandomExtraLongDummyToken";

      var convertedUrl = e._decorate(e._url);

      expect(expectedConvertedUrl).toEqual(convertedUrl);
    });

    it('should decorate a url with userinfo', function () {
      //GIVEN
      var e = new StreamdataEventSource("http://john:doe@www.google.fr?toto=1",  "someRandomExtraLongDummyToken");
      var expectedConvertedUrl = "https://streamdata.motwin.net/http://john:doe@www.google.fr/?toto=1&X-Sd-Token=someRandomExtraLongDummyToken";

      var convertedUrl = e._decorate(e._url);

      expect(expectedConvertedUrl).toEqual(convertedUrl);
    });

    it('should decorate a url with userinfo and query param with @', function () {
      //GIVEN
      var e = new StreamdataEventSource("http://john:doe@www.faroo.com/api?q=knicks&start=1&length=10&l=en&src=news&f=json&key=gbnEDrs@SAjQd6OVhqY_",  "someRandomExtraLongDummyToken");
      var expectedConvertedUrl = "https://streamdata.motwin.net/http://john:doe@www.faroo.com/api?q=knicks&start=1&length=10&l=en&src=news&f=json&key=gbnEDrs@SAjQd6OVhqY_&X-Sd-Token=someRandomExtraLongDummyToken";

      var convertedUrl = e._decorate(e._url);

      expect(expectedConvertedUrl).toEqual(convertedUrl);
    });

    it('should decorate a url with params that contains an @', function () {
      //GIVEN
      var e = new StreamdataEventSource("http://www.faroo.com/api?q=knicks&start=1&length=10&l=en&src=news&f=json&key=gbnEDrs@SAjQd6OVhqY_",  "someRandomExtraLongDummyToken");
      var expectedConvertedUrl = "https://streamdata.motwin.net/http://www.faroo.com/api?q=knicks&start=1&length=10&l=en&src=news&f=json&key=gbnEDrs@SAjQd6OVhqY_&X-Sd-Token=someRandomExtraLongDummyToken";

      var convertedUrl = e._decorate(e._url);

      expect(expectedConvertedUrl).toEqual(convertedUrl);
    });

    it('should decorate a url with port', function () {
      //GIVEN
      var e = new StreamdataEventSource("http://www.toto.com:3009/api?q=knicks&start=1&length=10&l=en&src=news&f=json&key=gbnEDrs@SAjQd6OVhqY_",  "someRandomExtraLongDummyToken");
      var expectedConvertedUrl = "https://streamdata.motwin.net/http://www.toto.com:3009/api?q=knicks&start=1&length=10&l=en&src=news&f=json&key=gbnEDrs@SAjQd6OVhqY_&X-Sd-Token=someRandomExtraLongDummyToken";

      var convertedUrl = e._decorate(e._url);

      expect(expectedConvertedUrl).toEqual(convertedUrl);
    });

  });

  describe('ChecklistenersCallbacks', function() {
    it('should callback with data event when good url is called', function () {
      //GIVEN
      var e = new StreamdataEventSource("http://www.test.com", "dummyToken");
      var data = false;

      e.streamdataConfig.PROTOCOL = "http://";
      e.streamdataConfig.HOST = "localhost";
      e.streamdataConfig.PORT = "8080";

      var datacb = function(event){
                               console.log(event);
                               e.close();
                               data =  true;
                               expect(data).toBeFalsy();
                               };
      var errorcb = function(error){
                                console.log(error);
                                e.close();
                                data = false;
                                expect(data).toBeTruthy();
                                };
      Logger.level = Logger.DEBUG;

      e.onData(datacb).onError(errorcb);

      expect(function() {
        e.open();
      }).toBeTruthy();


    });

    it('should callback with error event when bad url called', function () {
      //GIVEN
      var e = new StreamdataEventSource("http://www.test.fr", "dummyToken");
      var error = false;
      e.streamdataConfig.PROTOCOL = "http://";
      e.streamdataConfig.HOST = "localhost";
      e.streamdataConfig.PORT = "8080";
      Logger.setLevel(Logger.DEBUG);

      e.onData(function(event){
          Logger.debug(event);
          e.close();
          error = e.isConnected();
          expect(error).toBeTruthy();
          })
      .onError(function(error){
          Logger.error("There is an error: {0}",error.getMessage());
          e.close();
          error = true;
          expect(error).toBeTruthy();
          })
      .onPatch(function(error){
          Logger.debug(error);
          e.close();
          error = true;
          expect(error).toBeTruthy();
          })
       .onMonitor(function(error){
          Logger.debug(error);
          e.close();
          error = true;
          expect(error).toBeTruthy();
          });

      e.open();


    });

    it('should not callback when callback off', function () {
      //GIVEN
      var e = new StreamdataEventSource("http://www.test.com", "dummyToken");
      var error = e.isConnected();
      e.streamdataConfig.PROTOCOL = "http://";
      e.streamdataConfig.HOST = "localhost";
      e.streamdataConfig.PORT = "8080";
      Logger.setLevel(Logger.DEBUG);


      var opencb =function(event){
                Logger.debug(event);
                e.close();
                error = true;
                expect(error).toBeTruthy();
                };

      var datacb =function(event){
                Logger.debug(event);
                e.close();
                error = true;
                expect(error).toBeTruthy();
                };

      var patchcb = function(error){
                Logger.debug(error);
                e.close();
                error = true;
                expect(error).toBeTruthy();
                };

      var errorcb = function(error){
                Logger.debug(error);
                e.close();
                error = true;
                expect(error).toBeTruthy();
                };

      var monitorcb = function(error){
                Logger.debug(error);
                e.close();
                error = true;
                expect(error).toBeTruthy();
                };

      e.open();

      expect(error).toBe(false);

    });

 });

});
