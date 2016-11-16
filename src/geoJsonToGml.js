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
