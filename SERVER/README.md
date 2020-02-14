<!-- vscode-markdown-toc -->
* 1. [Identification](#Identification)
* 2. [List Files](#ListFiles)
* 3. [Get Header of cube](#Getheaderofcube)
* 4. [Get slide of cube](#Getslideofcube)
* 5. [Get spectre values](#Getspectrevalues)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

# API server documentation

##  1. <a name='Identification'></a>Identification 
(API to connect user) : Method POST with two values
http://localhost:8081/cubeExplorer/rest/identification
 
``` json
{
  "username": "<username>",
  "password": "<password>"
}
```
Json response example :
```json
{
	"role":"public",
	"message":true
}
```

##  2. <a name='ListFiles'></a>List Files 
(API return all files availables : files conatining into private and public folders): Method GET
http://localhost:8081/cubeExplorer/rest/listFiles

Json response example :

```json
{
	"private_files": [
		"1584_2.nc",
		"1585_2.nc",
		],
	"public_files": [
		"1583_2.nc",
		"1342228703_M17-2_SPIRE-FTS_15.0.3244_HR_SLW_gridding_cube.fits",
		"0232_2.nc"
		],
	"status":"OK"
}
```

##  3. <a name='Getheaderofcube'></a>Get header of cube 
(following parameter return metadata and values to calculate lat/long)
- Parameter entry : input file (with extension)
-  Parameter metadata : 
    - if metadata parameter is not present, api return all metadata of file.
    - if metadata parameter is present with empty value, api return feature containing all properties 
http://localhost:8081/cubeExplorer/rest/header?entry=<file>&metadata=<metadata_value>

Json response example for url "http://localhost:8081/cubeExplorer/rest/header?entry=1342228703_M17-2_SPIRE-FTS_15.0.3244_HR_SLW_gridding_cube.fits"
<details open>
  <summary> &larr; <small>click here to collapse/expand json</small>
</summary>
  
```json
{
	"response":{
			"feature":
			{
				"geometry":{"coordinates":[0,0],"type":"Point"},
				"type":"Feature",
				"properties":{
					"metadata":[["XTENSION","IMAGE","marks beginning of new HDU"],["BITPIX","-64","bits per data value"],["NAXIS","3","number of axes"],["NAXIS1","12","size of the n'th axis"], ... ], // These are the metadata of the file. To get only the NAXIS1 information in this table, add the parameter "&metadata=NAXIS1" to the url.
					"fileType":"fits",
					"dimensions":{
						"typeVal":"Value",
						"typeY":"DEC--TAN",
						"stepZ":0.29979246854782104,
						"typeX":"RA---TAN",
						"stepX":-0.004861111287027597,
						"stepY":0.004861111287027597,
						"refLat":"-16.216666666666665",
						"unitX":"deg",
						"refX":"6.0",
						"unitY":"deg",
						"unitZ":"GHz",
						"refZ":"953.0",
						"refY":"8.0",
						"unitVal":"W m-2 Hz-1 sr-1",
						"refLevel":"732.39297489",
						"typeZ":"Frequency",
						"dimZ":1905,
						"dimY":15,
						"dimX":12,
						"refLon":"275.0937083333333"
					}
				}
			}
		},
	"status":"OK"
}
```
</details>

To get only the NAXIS1 information in this table, add the parameter "&metadata=NAXIS1" to the url.
<details>
  <summary> &larr; <small>click here to collapse/expand json</small>
</summary>
  
```json
{
	"response":{
		"feature":{
			"geometry":{
				"coordinates":[0,0],
				"type":"Point"
				},
				"type":"Feature",
				"properties":{
					"metadata":[["NAXIS1","12","size of the n'th axis"]],
					"fileType":"fits",
					"dimensions":{
						"typeVal":"Value",
						"typeY":"DEC--TAN",
						"stepZ":0.29979246854782104,
						"typeX":"RA---TAN",
						"stepX":-0.004861111287027597,
						"stepY":0.004861111287027597,
						"refLat":"-16.216666666666665",
						"unitX":"deg",
						"refX":"6.0",
						"unitY":"deg",
						"unitZ":"GHz",
						"refZ":"953.0",
						"refY":"8.0",
						"unitVal":"W m-2 Hz-1 sr-1",
						"refLevel":"732.39297489",
						"typeZ":"Frequency",
						"dimZ":1905,
						"dimY":15,
						"dimX":12,
						"refLon":"275.0937083333333"
					}
				}
			}
	},
		"status":"OK"
}
```
</details>

##  4. <a name='Getslideofcube'></a>Get slide of cube
- Parameter entry : input file (with extension)
- Parameter posZ : slide number
http://localhost:8081/cubeExplorer/rest/slide?entry=<file>&posZ=<slideNumber>

Json response example for url http://localhost:8081/cubeExplorer/rest/slide?entry=1342228703_M17-2_SPIRE-FTS_15.0.3244_HR_SLW_gridding_cube.fits&posZ=408
<details open>
  <summary> &larr; <small>click here to collapse/expand json</small>
</summary>
  
```json
{
	"response":{
		"feature":{
			"geometry":{"coordinates":[1,408],"type":"Point"},
			"type":"Feature",
			"properties":{
				"metadata":[],
				"slide":{
					"value":[
						[1.827764526504488e-17,1.6082210236585463e-17,1.7133946739285123e-17, ...],
						[6.601798147251461e-18,1.058571490683957e-17,2.2529356642468686e-17, ...],
						[5.870161532497862e-18,1.3749972598052792e-17,1.758735215210719e-17, ..],
						 ... 
						]
					},
				"fileType":"fits"
				}
			}
		},
	"status":"OK"
}
```
</details>

##  5. <a name='Getspectrevalues'></a>Get spectre values 
Method GET

- Parameter entry : input file (with extension)
- Parameter metadata : NAXIS.
- Parameter posX : coordinate X
- Parameter posY : coordinate Y
http://localhost:8081/cubeExplorer/rest/spectrum?entry=<file>&metadata=NAXIS.&posX=<x>&posY=<y>

Json response example for urlhttp://localhost:8081/cubeExplorer/rest/spectrum?entry=1342228703_M17-2_SPIRE-FTS_15.0.3244_HR_SLW_gridding_cube.fits&metadata=NAXIS.&posX=6&posY=7

<details open>
  <summary> &larr; <small>click here to collapse/expand json</small>
</summary>
  
```json
{
	"response":{
		"feature":{
			"geometry":{"coordinates":[6,7],"type":"Point"},
			"type":"Feature",
			"properties":{
				"metadata":[["NAXIS1","12"],["NAXIS2","15"],["NAXIS3","1905"]],
				"spectrum":{
					"wavelength":[446.6907958984375,446.9905700683594,447.2903747558594, ... ], // correspond to the abscissa of the spectrum (even if it's in frequency the keyword is still "wavelength" so far.)
					"value":[2.1621268312117027e-17,2.065115143637593e-17,2.0809775452393622e-17,  ... ]
					},
				"fileType":"fits"
				}
			}
		},
	"status":"OK"
}
```
</details>