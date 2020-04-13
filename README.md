**Geojson map renderer written with Node.js, Express and MapBox**

This simple Map Server application outputs maps in GeoJson format using:
- Node.js and Express as backend
- Mapbox and vanilla Javascript as frontend

To use Mapbox gl library put your access token in /public/js/constants.js file:


```javascript
export const MAPBOX_ACCESSTOKEN = 'put-your-api-key'
```

To start map server run:


```javascript
npm start
```