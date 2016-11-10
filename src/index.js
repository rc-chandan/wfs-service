var axios = require("axios");
var xml = require("xml");

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

  console.log(xml(WFSTransactionRequestXML, true));
  return xml(WFSTransactionRequestXML, true);
}

function createWFSRequest(operation, typeAttrs, filter) {
  var WFSTransactionRequestXML = buildBaseTransactionXML();
  var WFSOperationBaseXML = buildOpertaionXML(operation, typeAttrs, filter);
  WFSTransactionRequestXML["wfs:Transaction"].push(WFSOperationBaseXML);

  console.log(xml(WFSTransactionRequestXML, true));
  return xml(WFSTransactionRequestXML, true);
}

function createWFSRequest(operation, typeAttrs, filter, feature) {
  var WFSTransactionRequestXML = buildBaseTransactionXML();
  var WFSOperationBaseXML = buildOpertaionXML(operation, typeAttrs, filter, feature);
  WFSTransactionRequestXML["wfs:Transaction"].push(WFSOperationBaseXML);

  console.log(xml(WFSTransactionRequestXML, true));
  return xml(WFSTransactionRequestXML, true);
}



function insertFeature(feature) {
  var reqBody = createWFSRequest("Insert", feature);
}


function updateFeature(typeAttrs, filter, feature) {
  var reqBody = createWFSRequest("Update", typeAttrs, filter, feature);
  console.log(reqBody);

  var host = "http://192.168.1.83:19090/maps?service=WFS&version=1.1.0&request=Transaction";
  var params = {
    data: reqBody,
  }

  var connection = axios.create({
    headers: {'Content-Type': 'application/xml'}
  });

  connection.put(host, reqBody)
  .then(function (response) {
    console.log(xml(response, true));
  })
  .catch(function (error) {
    console.log(error);
  });
}


function deleteFeature(typeAttrs, filter) {
  var reqBody = createWFSRequest("Delete", typeAttrs, filter);
}






// Testing
var typeAttrs= {name: "typeName", value: "georbis:world_boundaries"}
var filter = { propertyName: "name", literal: "Sri Lanka"};
var feature = {
  pop2005: 20000
}

updateFeature(typeAttrs, filter, feature);
