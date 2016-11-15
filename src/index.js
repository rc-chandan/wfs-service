let axios = require("axios");
let xml = require("xml");
let geoJsonToGml = require("./geoJsonToGml");

(function(window, axios, xml, geoJsonToGml) {
  "user strict";

  let VERSION = "0.0.1";
  let HOST = "http://localhost:19090";

  if(axios === "undefined")
    throw new Error("axios lib not found");

  if(xml === "undefined")
    throw new Error("xml lib not found");

  let getTransactionXmlJson = function (operation, WFSOperationBaseXML) {
    let transactionXML = null;
    if(operation.toLowerCase() === "insert"){
        transactionXML = {
        "Transaction": [
          {
            "_attr": {
              "service": "WFS",
              "version": "1.0.0",
              "xmlns": "http://www.opengis.net/wfs",
              "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
              "xsi:schemaLocation": "http://www.vizexperts.com/",
              "xmlns:gml": "http://www.opengis.net/gml",
              "xmlns:georbis": "http://www.vizexperts.com/"
            }
          },
          // OperationXML will be pushed here
        ]
      };

        transactionXML["Transaction"].push(WFSOperationBaseXML);
      }else {
          transactionXML = {
          "wfs:Transaction": [
            {
              "_attr": {
                "service": "WFS",
                "version": "1.0.0",
                "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                "xsi:schemaLocation": "http://www.opengis.net/wfs",
                "xmlns:gml": "http://www.opengis.net/gml",
                "xmlns:wfs": "http://www.opengis.net/wfs",
                "xmlns:ogc": "http://www.opengis.net/ogc"
              }
            },
            // OperationXML will be pushed here
          ]
        };
        transactionXML["wfs:Transaction"].push(WFSOperationBaseXML);
      }

      return transactionXML;
  };

    var buildFilterXML = function (filter) {

      var filterQuery = {
        "ogc:Filter": [
          {
            "_attr": {

            }
          },
          {
            "PropertyIsEqualTo": [
              {
                "_attr": {

                }
              },
              {
                "PropertyName": filter.propertyName
              },
              {
                "Literal": filter.value
              }
            ]
          }
        ]
      };

      return filterQuery;
    }

    function buildUpdateFeatureXML(feature) {
      var propertyXML = {"wfs:Property": [{"_attr": {}}]};
      propertyXML["wfs:Property"].push({"wfs:Name": prop});
      propertyXML["wfs:Property"].push({"wfs:Value": feature[prop]});
      return propertyXML;
    }

    function buildInsertFeatureXML(geoJson, options) {
      return geoJsonToGml(geoJson, options);
    }

    function buildOpertaionXML(operation, typeName, filter, feature, options) {
      var operationXML, filterQuery, featureQuery;
      if(typeof filter !== "undefined") {
        filterQuery = buildFilterXML(filter);
      }

      if(typeof feature !== "undefined" && operation.toLowerCase() === "insert")
        featureQuery = buildInsertFeatureXML(feature, options);

      switch (operation.toLowerCase()) {
        case "insert":
          operationXML = {"Insert": [{"_attr": {}}]};
          operationXML["Insert"].push(featureQuery);
          break;
        case "update":
          operationXML = {"wfs:Update": [{"_attr": {typeName: typeName}}]};
          for(prop in feature) {
            if(feature.hasOwnProperty(prop)){
              featureQuery = buildUpdateFeatureXML((function (feature, prop) {
                var featureObj = {};
                featureObj[prop] = feature[prop];
                return featureObj;
              }(feature, prop)));
              operationXML["wfs:Update"].push(featureQuery);
            }
          }
          operationXML["wfs:Update"].push(filterQuery);
          break;
        case "delete":
          operationXML = {"wfs:Delete": [{"_attr": {typeName: typeName}}]};
          operationXML["wfs:Delete"].push(filterQuery);
          break;
        default:
          console.log("default");
      }

      return operationXML;
    }

    function createWFSRequest(operation, typeName, filter, geoJson, options) {
      var WFSOperationBaseXML = buildOpertaionXML(operation, typeName, filter, geoJson, options);
      var WFSTransactionRequestXML = getTransactionXmlJson(operation, WFSOperationBaseXML);
      // console.log(JSON.stringify(WFSTransactionRequestXML));
      return xml(WFSTransactionRequestXML, true);
    }

    function insertFeature(geoJson, options) {
      var reqBody = createWFSRequest("Insert", undefined, undefined, geoJson, options);
      console.log(reqBody);

      var url = HOST + "/wfs";
      var params = {
        data: reqBody,
      }

      var xhr = axios.create({
        headers: {'Content-Type': 'application/xml'}
      });

      xhr.post(url, reqBody)
      .catch(function(error) {
        console.log(error);
      });
    }


    function updateFeature(typeName, filter, feature) {
      var reqBody = createWFSRequest("Update", typeName, filter, feature);
      console.log(reqBody);

      var url = HOST + "/wfs";
      var params = {
        data: reqBody,
      }

      var xhr = axios.create({
        headers: {'Content-Type': 'application/xml'}
      });

      xhr.post(url, reqBody)
      .catch(function(error) {
        console.log(error);
      });
    }


    function deleteFeature(typeName, filter) {
      var reqBody = createWFSRequest("Delete", typeName, filter, undefined);
      console.log(reqBody);

      var url = HOST + "/wfs";
      var params = {
        data: reqBody,
      }

      var xhr = axios.create({
        headers: {'Content-Type': 'application/xml'}
      });

      xhr.post(url, reqBody)
      .catch(function(error) {
        console.log(error);
      });
    }

    var WFSEdit = {};
    WFSEdit.insert = insertFeature;
    WFSEdit.update = updateFeature;
    WFSEdit.delete = deleteFeature;

    window.WFSEdit = WFSEdit;

})(window, axios, xml, geoJsonToGml);


// Testing
var typeName= "georbis:world_boundaries";
var filter = { propertyName: "name", value: "ImaginaryNation"};
var feature = {
  "fips": "IM",
  "iso2": "IM",
  "iso3": "IMG",
  "un": "4",
  "name": "ImaginaryNation",
  "area": "65209",
  "pop2005": "25067407",
  "region": "142",
  "subregion": "34",
  "lon": "62.5",
  "lat": "3.5"
}

 // window.WFSEdit.update(typeName, filter, feature);
 window.WFSEdit.delete(typeName, filter);

var geoJson = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "fips": "IM",
        "iso2": "IM",
        "iso3": "IMG",
        "un": "4",
        "name": "ImaginaryNation",
        "area": "65209",
        "pop2005": "25067407",
        "region": "142",
        "subregion": "34",
        "lon": "62.5",
        "lat": "3.5"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [
            [
              60.0,
              2.0
            ],
            [
              65.0,
              2.0
            ]
          ]
        ]
      }
    }
  ]
};

var options = {
  featureNs: "georbis",
  featureName: "world_boundaries"
};
// window.WFSEdit.insert(geoJson, options);
