var axios = require("axios");
var xml = require("xml");

(function(window, axios, xml) {
  "user strict";

  var VERSION = "0.0.1";
  var HOST = "http://localhost:19090";

  if(axios === "undefined")
    throw new Error("axios lib not found");

  if(xml === "undefined")
    throw new Error("xml lib not found");


    var buildBaseTransactionXML = function () {
     return  {
        "wfs:Transaction": [
          {
            "_attr": {
              "version": "1.0.0",
              "service": "WFS",
              "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
              "xsi:schemaLocation": "http://www.vizexperts.com/",
              "xmlns:gml": "http://www.opengis.net/gml",
              "xmlns:wfs": "http://www.opengis.net/wfs",
              "xmlns:ogc": "http://www.opengis.net/ogc",
              "xmlns:georbis": "http://www.vizexperts.com/"
            }
          }
        ]
      }
    };

    function buildFilterXML(filter) {

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
                "PropertyName": filter.PropertyName
              },
              {
                "Literal": filter.literal
              }
            ]
          }
        ]
      };

      return filterQuery;
    }

    function buildUpdateFeatureXML(feature) {
      var propertyXML = {"wfs:Property": [{"_attr": {}}]};
      for(prop in feature) {
        if(feature.hasOwnProperty(prop)){
          var value = feature[prop];
          propertyXML["wfs:Property"].push({"wfs:Name": prop});
          propertyXML["wfs:Property"].push({"wfs:Value": value})
        }
      }
      return propertyXML;
    }

    function buildInsertFeatureXML(feature) {


      return {
        feature: "lksjdfj"
      }
    }

    function buildOpertaionXML(operation, attrs, filter, features) {
      var operationXML, filterQuery, featureQuery;
      if(typeof filter !== "undefined" && typeof attrs !== "undefined") {
        var name = attrs.name;
        var value = attrs.value;
        filterQuery = buildFilterXML(filter);
      }

      if(typeof feature !== "undefined" && operation.toLowerCase() === "update")
        featureQuery = buildUpdateFeatureXML(feature);

      if(typeof feature !== "undefined" && operation.toLowerCase() === "insert")
        featureQuery = buildInsertFeatureXML(feature);



      switch (operation.toLowerCase()) {
        case "insert":
          operationXML = {"wfs:Insert": [{"_attr": {}}]};
          operationXML["wfs:Insert"].push(featureQuery);
          break;
        case "update":
          operationXML = {"wfs:Update": [{"_attr": {name: value}}]};
          operationXML["wfs:Update"].push(featureQuery);
          operationXML["wfs:Update"].push(filterQuery);
          break;
        case "delete":
          operationXML = {"wfs:Delete": [{"_attr": {name: value}}]};
          operationXML["wfs:Delete"].push(filterQuery);
          break;
        default:
          console.log("default");
      }

      return operationXML;
    }


    function createWFSRequest(operation, feature) {
      var WFSTransactionRequestXML = buildBaseTransactionXML();
      var WFSOperationBaseXML = buildOpertaionXML(operation, feature);
      WFSTransactionRequestXML["wfs:Transaction"].push(WFSOperationBaseXML);

      console.log(WFSTransactionRequestXML);
      return xml(WFSTransactionRequestXML, true);
    }

    function createWFSRequest(operation, typeAttrs, filter) {
      var WFSTransactionRequestXML = buildBaseTransactionXML();
      var WFSOperationBaseXML = buildOpertaionXML(operation, typeAttrs, filter);
      WFSTransactionRequestXML["wfs:Transaction"].push(WFSOperationBaseXML);

      console.log(WFSTransactionRequestXML);
      return xml(WFSTransactionRequestXML, true);
    }

    function createWFSRequest(operation, typeAttrs, filter, feature) {
      var WFSTransactionRequestXML = buildBaseTransactionXML();
      var WFSOperationBaseXML = buildOpertaionXML(operation, typeAttrs, filter, feature);
      WFSTransactionRequestXML["wfs:Transaction"].push(WFSOperationBaseXML);

      console.log(WFSTransactionRequestXML);
      return xml(WFSTransactionRequestXML, true);
    }

    function insertFeature(feature) {
      var reqBody = createWFSRequest("Insert", feature);
      console.log(reqBody);

      var url = HOST + "/maps?service=WFS&version=1.1.0&request=Transaction";
      var params = {
        data: reqBody,
      }

      var xhr = axios.create({
        headers: {'Content-Type': 'application/xml'}
      });

      // xhr.post(url, reqBody)
      // .catch(function(error) {
      //   console.log(error);
      // });
    }


    function updateFeature(typeAttrs, filter, feature) {
      var reqBody = createWFSRequest("Update", typeAttrs, filter, feature);
      console.log(reqBody);

      var url = HOST + "/maps?service=WFS&version=1.1.0&request=Transaction";
      var params = {
        data: reqBody,
      }

      var xhr = axios.create({
        headers: {'Content-Type': 'application/xml'}
      });

      // xhr.put(url, reqBody)
      // .catch(function(error) {
      //   console.log(error);
      // });
    }


    function deleteFeature(typeAttrs, filter) {
      var reqBody = createWFSRequest("Delete", typeAttrs, filter);
      console.log(reqBody);

      var url = HOST + "/maps?service=WFS&version=1.0.0&request=Transaction";
      var params = {
        data: reqBody,
      }

      var xhr = axios.create({
        headers: {'Content-Type': 'application/xml'}
      });

      // xhr.delete(url, reqBody)
      // .catch(function(error) {
      //   console.log(error);
      // });
    }



    var WFSEdit = {};
    WFSEdit.insert = insertFeature;
    WFSEdit.update = updateFeature;
    WFSEdit.delete = deleteFeature;

    window.WFSEdit = WFSEdit;


}(window, axios, xml));


// Testing
var typeAttrs= {name: "typeName", value: "georbis:world_boundaries"}
var filter = { propertyName: "name", literal: "Sri Lanka"};
var feature = {
  pop2005: 20000
}
//
// window.WFSEdit.insert(feature);
// window.WFSEdit.update(typeAttrs, filter, feature);
// window.WFSEdit.delete(typeAttrs, filter);

var obj = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "marker-color": "#ff0000",
        "marker-size": "medium",
        "marker-symbol": ""
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          2.8125,
          37.43997405227057
        ]
      }
    }
  ]
};

console.log(xml(obj, true));
