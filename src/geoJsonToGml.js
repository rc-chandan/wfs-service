function geoJsonToGml(geoJson) {

  // The base featureCollection xmlJson without any feature members
  var featureCollectionXmlJson = {
        "wfs:FeatureCollection": [
            {
                "_attr": {
                    "xmlns:wfs": "http://www.opengis.net/wfs"
                }
            }
            // Feature members will be pushed here
        ]
    };

    // Get a hold of the features node so that we can push feature members here
    var featureCollectionNode = featureCollectionXmlJson["wfs:FeatureCollection"];

    // Get all the features in given geoJson and loop through it
    var features = geoJson.features;
    for(var feature in features) {

      var geometry = features[feature].geometry;
      var vectorType = geometry.type;

      var fid_value = 9;
      if(vectorType.localeCompare("LineString") === 0){
        fid_value = 13;
      }
      else if(vectorType.localeCompare("Polygon") === 0){
        fid_value = 22;
      }

      var featureMembersXmlJson = {
                "gml:featureMember":[
                    {
                        "_attr": {
                            "xmlns:gml": "http://www.opengis.net/gml"
                        }
                    },
                    {
                        "feature:features": [{
                          "_attr": {"xmlns:feature": "http://mapserver.gis.umn.edu/mapserver", "fid": "OpenLayers.Feature.Vector_" + fid_value}
                        },
                        // props will be pushed here
                        // geometry will be pushed here
                        ]
                    }
                ]
            };
      // The base feature member xmlJson skeleton without any props and geometry

      var geometryXmlJson = {
        "feature:geometry" : [
        {
          // geomSkeliton will be added here with proper geometry type
        }
      ]};

      var geomSkeliton = [
            {
              "gml:coordinates": [
                {
                  "_attr":{"decimal": ".", "cs":",", "ts":" "}
                },
              ]
            }
          ];

    var featuresNode = featureMembersXmlJson["gml:featureMember"][1]["feature:features"];

    var geomtype = "gml:" + vectorType;
    geometryXmlJson["feature:geometry"][0][geomtype] = geomSkeliton;
    featuresNode.push(geometryXmlJson);

    var properties = features[feature].properties;
    for(prop in properties) {
        if(properties.hasOwnProperty(prop)) {
            var propObj = {};
            propObj["feature:" + prop] = properties[prop]
            featuresNode.push(propObj);
        }
    }

    var coordinates = geometry.coordinates;

    var coordinatesArr = geometryXmlJson["feature:geometry"][0][geomtype][0]["gml:coordinates"];
    var coordinateStr = "";
    for(coor in coordinates) {
      coordinateStr += coordinates[coor] + ",";
    }

    coordinatesArr.push(coordinateStr.slice(0, coordinateStr.length - 1));
    featureCollectionNode.push(featureMembersXmlJson);
  }

  return featureCollectionXmlJson;
}