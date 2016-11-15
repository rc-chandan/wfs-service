var service = require("./WfsEdit");

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
        "name": "Updated",
        "area": "65209",
        "pop2005": "25067407",
        "region": "142",
        "subregion": "4",
        "lon": "62.5",
        "lat": "3.5"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [55.0,2.0],
            [65.0,2.0],
            [65.0,5.0],
            [55.0,5.0],
            [55.0,2.0]
          ]
        ]
      }
    }
  ]
};

var typeName = "georbis:world_boundaries";
var fid = "world_boundaries.335";

window.WFSEdit.delete(typeName, fid);
// window.WFSEdit.update(typeName, fid, geoJson);
 // window.WFSEdit.insert(typeName, geoJson);
