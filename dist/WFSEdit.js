webpackJsonp([0],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author Chandan Rana (rc_chandan)
	 */

	/**
	 * @module WFSEdit
	 * Adds the WFSEdit object to browser window with insert, update and delete wfs functionalities
	 * @param {object} window - global object for browsers
	 * @param {object} geoJsonToGml - library to convert geoJson to gml see: ./geoJsonToGml.js
	 * This module depends on the following npm modules
	 * @param {object} axios - async xhr library see : https://www.npmjs.com/package/axios
	 * @param {function} xml - library to convert json obj to xml and vice versa see : https://www.npmjs.com/package/xml
	**/

	let axios = __webpack_require__(1);
	let xml = __webpack_require__(27);
	let geoJsonToGml = __webpack_require__(51);

	(function(window, axios, xml, geoJsonToGml) {
	  "user strict";

	  let VERSION = "0.0.1";

	  // TODO: Host needs to be changed according to the config of WFS server
	  let HOST = "http://" + window.location.host;

	  if(axios === "undefined")
	    throw new Error("axios lib not found");

	  if(xml === "undefined")
	    throw new Error("xml lib not found");

	  let _getTransactionXmlJson = function (operation, WFSOperationBaseXML) {

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

	  let _buildFilterXML = function (fid) {
	    let filterQuery = {
	      "ogc:Filter": [
	        {
	          "_attr": {
	          }
	        },
	        {
	          "FeatureId": [{
	            "_attr": {
	              "fid": [fid]
	            }
	          }]
	        }
	      ]
	    };
	    return filterQuery;
	  }

	  let _buildUpdateFeatureXML = function (feature) {
	    var propertyXML = {"wfs:Property": [{"_attr": {}}]};
	    propertyXML["wfs:Property"].push({"wfs:Name": feature.name});
	    propertyXML["wfs:Property"].push({"wfs:Value": feature.value});
	    return propertyXML;
	  }

	  let _buildInsertFeatureXML = function (geoJson, typeName) {
	    return geoJsonToGml.convertToGml(geoJson, typeName);
	  }

	  let _buildOpertaionXML = function (operation, typeName, fid, geoJson) {
	    let operationXML, filterQuery, featureQuery;
	    if(typeof fid !== "undefined") {
	      filterQuery = _buildFilterXML(fid);
	    }

	    if(typeof geoJson !== "undefined" && operation.toLowerCase() === "insert")
	      gmlQuery = _buildInsertFeatureXML(geoJson, typeName);

	    switch (operation.toLowerCase()) {
	      case "insert":
	        operationXML = {"Insert": [{"_attr": {"xmlns": "http://www.opengis.net/wfs"}}]};
	        operationXML["Insert"].push(gmlQuery);
	        break;
	      case "update":
	        operationXML = {"wfs:Update": [{"_attr": {"typeName": typeName}}]};
	        let properties = geoJson.features[0].properties;
	        for(prop in properties) {
	          if(properties.hasOwnProperty(prop)){
	            gmlQuery = _buildUpdateFeatureXML((function (geoJson, prop) {
	              let featureObj = {name: prop, value: properties[prop]};
	              return featureObj;
	            }(properties, prop)));
	            operationXML["wfs:Update"].push(gmlQuery);
	          }
	        }

	        if(typeof geoJson.features[0].geometry === "object") {
	          let geom = geoJson.features[0].geometry;
	          let vectorType = geom.type;
	          let geomQuery = geoJsonToGml.getGeomXmlJson(vectorType, geom);
	          console.log(JSON.stringify(geomQuery));
	          operationXML["wfs:Update"].push(_buildUpdateFeatureXML({name: "geom", value: [geomQuery.geom[1]]}));
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

	  let _createWFSRequest = function (operation, typeName, fid, geoJson) {
	    let WFSOperationBaseXML = _buildOpertaionXML(operation, typeName, fid, geoJson, typeName);
	    let WFSTransactionRequestXML = _getTransactionXmlJson(operation, WFSOperationBaseXML);
	    console.log(xml(WFSTransactionRequestXML, true));
	    return xml(WFSTransactionRequestXML, true);
	  }

	  /**
	   * Converts the provided geoJson to gml insert request
	   * and send a xhr post with insert request to the WFS server.
	   * @param {string} typeName - data store to send the request ex: 'georbis:world_boundaries'
	   * @param {object} geoJson - the geoJson feature data that needs to be inserted.
	  **/
	  let insertFeature = function (typeName, geoJson) {
	    let reqBody = _createWFSRequest("Insert", typeName, undefined, geoJson);
	    let url = HOST + "/wfs";
	    let params = {
	      data: reqBody,
	    }

	    let xhr = axios.create({
	      headers: {'Content-Type': 'application/xml'}
	    });

	    xhr.post(url, reqBody)
	    .catch(function(error) {
	      console.log(error);
	    });
	  }

	  /**
	   * Converts the provided geoJson to gml update request
	   * and send a xhr post with update request to the WFS server.
	   * @param {string} typeName - data store to send the request ex: 'georbis:world_boundaries'
	   * @param {string} fid - fid of the feature that needs to be updated
	   * @param {object} geoJson - the geoJson feature data that needs to be inserted.
	  **/
	  let updateFeature = function (typeName, fid, geoJson) {
	    let reqBody = _createWFSRequest("Update", typeName, fid, geoJson);
	    let url = HOST + "/wfs";
	    let params = {
	      data: reqBody,
	    }
	    let xhr = axios.create({
	      headers: {'Content-Type': 'application/xml'}
	    });

	    xhr.post(url, reqBody)
	    .catch(function(error) {
	      console.log(error);
	    });
	  }

	  /**
	   * Converts the provided geoJson to gml delete request
	   * and send a xhr post with delete request to the WFS server.
	   * @param {string} typeName - data store in which deletion will be performed ex: 'georbis:world_boundaries'
	   * @param {string} fid - fid of the feature that needs to be deleted
	  **/
	  let deleteFeature = function (typeName, fid) {
	    let reqBody = _createWFSRequest("Delete", typeName, fid, undefined);
	    let url = HOST + "/wfs";
	    let params = {
	      data: reqBody,
	    }
	    let xhr = axios.create({
	      headers: {'Content-Type': 'application/xml'}
	    });

	    xhr.post(url, reqBody)
	    .catch(function(error) {
	      console.log(error);
	    });
	  }

	  let WFSEdit = {};
	  WFSEdit.insert = insertFeature;
	  WFSEdit.update = updateFeature;
	  WFSEdit.delete = deleteFeature;

	  window.WFSEdit = WFSEdit;

	})(window, axios, xml, geoJsonToGml);


/***/ },

/***/ 51:
/***/ function(module, exports) {

	/**
	 * @author Chandan Rana (rc_chandan)
	 */

	/**
	 * @module geoJsonToGml
	 * Converts geoJson objects to gml json format,
	 * which can be parsed by xml parser to create gml data
	**/

	/**
	 * Converts the provided geoJson to gmlJson object, which can then be parsed by xml library to create gml.
	 * @param {object} geoJson - the geoJson feature data to convert.
	 * @param {string} typeName - data store to send the request ex: 'georbis:world_boundaries'
	**/
	function convertToGml(geoJson, typeName) {
	  var typeName = typeName || "wfs:features";

	    // The base featureCollection xmlJson
	    let featureCollectionXmlJson = {
	      [typeName]: [
	        {
	          "_attr": {"xmlns": "http://www.vizexperts.com/"}
	        },
	      ]
	    };

	    // Get all the features in given geoJson and loop through it
	    let features = geoJson.features;
	    for(let feature in features) {
	      let geometry = features[feature].geometry;
	      let vectorType = geometry.type;
	      let featuresNode = featureCollectionXmlJson[typeName];
	      let properties = features[feature].properties;
	      for(let prop in properties) {
	          if(properties.hasOwnProperty(prop)) {
	              let propObj = {};
	              propObj["georbis:" + prop] = properties[prop]
	              featuresNode.push(propObj);
	          }
	      }
	      let geomXmlJson = getGeomXmlJson(vectorType, geometry);
	      featuresNode.push(geomXmlJson);
	    }

	    return featureCollectionXmlJson;
	}

	/**
	 * Only converts the geometry part of single geoJson feature object to gmlJson object, which can then be parsed by xml  * library to make only the geom node in gml.
	 * @param {object} geometry - The geometry part of the geoJson.
	 * @param {string} vectorType - Type of vector feature ex: 'point', 'linestring', 'polygon'
	**/
	function getGeomXmlJson (vectorType, geometry) {
	  let geomXmlJson = _getBaseGeomXmlJson(vectorType);
	  let coordinates = [];
	  if(vectorType.toLowerCase() === "point")
	    coordinates.push(geometry.coordinates);
	  else
	    coordinates = geometry.coordinates[0]

	  let coordinatesArr = _getCoordinateArrayLocation(vectorType, geomXmlJson);
	  coordinatesArr.push(_getCoordinateStr(coordinates));
	  return geomXmlJson;
	}

	function _getCoordinateArrayLocation(vectorType, geomXmlJson) {
	  let coordinatesArr = null;
	  switch(vectorType.toLowerCase()) {
	    case "point":
	      coordinatesArr = geomXmlJson["geom"][1]["gml:Point"][1]["gml:coordinates"];
	      break;
	    case "linestring":
	      coordinatesArr = geomXmlJson["geom"][1]["gml:LineString"][1]["gml:coordinates"];;
	      break;
	    case "polygon":
	      coordinatesArr = geomXmlJson["geom"][1]["gml:MultiPolygon"][1]["gml:polygonMember"][0]["gml:Polygon"][0]["gml:outerBoundaryIs"][0]["gml:LinearRing"][0]["gml:coordinates"];
	      break;
	  }
	  return coordinatesArr;
	}

	function _getVectorXmlJson (vectorType) {
	  let pointSkeliton = {
	    "gml:Point": [
	      { "_attr": {"srsName": "EPSG:4326"}},
	      {
	        "gml:coordinates": [
	          // Coordinate values will be pushed here
	        ]
	      }
	    ]
	  };

	  let lineStringSkeliton = {
	    "gml:LineString": [
	      { "_attr": {"srsName": "EPSG:4326"}},
	      {
	        "gml:coordinates": [
	          // Coordinate values will be pushed here
	        ]
	      }
	    ]
	  };

	  let polygonSkeliton = {
	      "gml:MultiPolygon": [
	        { "_attr":{"srsName": "EPSG:4326"}},
	        {
	          "gml:polygonMember": [{
	              "gml:Polygon":[{
	                "gml:outerBoundaryIs": [{
	                  "gml:LinearRing": [{
	                    "gml:coordinates": [

	                      // Coordinate values will be pushed here
	                    ]
	                  }]
	                }]
	            }]
	          }]
	        }
	      ]
	  };

	  let vectorData = null;
	  switch(vectorType.toLowerCase()) {
	    case "point":
	      vectorData = pointSkeliton;
	      break;
	    case "linestring":
	      vectorData = lineStringSkeliton;
	      break;
	    case "polygon":
	      vectorData = polygonSkeliton;
	      break;
	  }
	  return vectorData;
	}

	function _getCoordinateStr(coordinates) {
	  let coordinateStr = "";
	  for(let pair in coordinates) {
	    for(let num in coordinates[pair]){
	      coordinateStr += coordinates[pair][num] + ",";
	    }
	    coordinateStr = coordinateStr.slice(0, coordinateStr.length - 1);
	    coordinateStr += " ";
	  }
	  coordinateStr = coordinateStr.slice(0, coordinateStr.length - 1);
	  return coordinateStr;
	}

	function _getBaseGeomXmlJson(vectorType) {
	  let geomXmlJson = {
	    "geom" : [
	      {
	        "_attr": {"xmlns": "http://www.vizexperts.com/"}
	      }
	      // geomSkeliton will be added here with proper geometry type
	  ]};
	  let vectorData =  _getVectorXmlJson(vectorType);
	  geomXmlJson["geom"].push(vectorData);

	  return geomXmlJson;
	}

	module.exports = {
	  convertToGml: convertToGml,
	  getGeomXmlJson: getGeomXmlJson
	};


/***/ }

});