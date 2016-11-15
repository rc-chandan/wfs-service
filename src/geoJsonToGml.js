function geoJsonToGml(geoJson, typeName) {

  var typeName = typeName || "wfs:features";

  function getVectorXmlJson (vectorType) {
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

  function getCoordinateArrayLocation(vectorType, geometryXmlJson) {
    let coordinatesArr = null;
    switch(vectorType.toLowerCase()) {
      case "point":
        coordinatesArr = geometryXmlJson["geom"][1]["gml:Point"][1]["gml:coordinates"];
        break;
      case "linestring":
        coordinatesArr = geometryXmlJson["geom"][1]["gml:LineString"][1]["gml:coordinates"];;
        break;
      case "polygon":
        coordinatesArr = geometryXmlJson["geom"][1]["gml:MultiPolygon"][1]["gml:polygonMember"][0]["gml:Polygon"][0]["gml:outerBoundaryIs"][0]["gml:LinearRing"][0]["gml:coordinates"];
        break;
    }
    return coordinatesArr;
  }

    function getGeomXmlJson(vectorType) {
      let geomXmlJson = {
        "geom" : [
          {
            "_attr": {"xmlns": "http://www.vizexperts.com/"}
          }
          // geomSkeliton will be added here with proper geometry type
      ]};
      let vectorData =  getVectorXmlJson(vectorType);
      geomXmlJson["geom"].push(vectorData);
      return geomXmlJson;
    }

    function getCoordinateStr(coordinates) {
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

    // The base featureCollection xmlJson
    featureCollectionXmlJson = {
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
      let geometryXmlJson = getGeomXmlJson(vectorType);
      featuresNode.push(geometryXmlJson);

      let properties = features[feature].properties;
      for(let prop in properties) {
          if(properties.hasOwnProperty(prop)) {
              let propObj = {};
              propObj["georbis:" + prop] = properties[prop]
              featuresNode.push(propObj);
          }
      }

      let coordinates = [];
      if(vectorType.toLowerCase() === "point")
        coordinates.push(geometry.coordinates);
      else
        coordinates = geometry.coordinates[0]

      let coordinatesArr = getCoordinateArrayLocation(vectorType, geometryXmlJson);
      coordinatesArr.push(getCoordinateStr(coordinates));
    }

    return featureCollectionXmlJson;
}

module.exports = geoJsonToGml;
