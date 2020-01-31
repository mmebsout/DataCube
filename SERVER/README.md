<!-- vscode-markdown-toc -->
* 1. [Identification](#Identification)
* 2. [List Files](#ListFiles)
* 3. [Get slide of cube](#Getslideofcube)
* 4. [Get slide of cube](#Getslideofcube-1)
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
JSON : {login:<login_value>;password:<password_calue>}

##  2. <a name='ListFiles'></a>List Files 
(API return all files availables : files conatining into private and public folders): Method GET
http://localhost:8081/cubeExplorer/rest/listFiles

##  3. <a name='Getslideofcube'></a>Get slide of cube 
(following parameter return metadata and values to calcultate lat/long)
- Parameter entry : input file (with extension)
-  Parameter metadata : 
    - if metadata parameter is not present, api return all metadatas of file.
    - if metata parameter is present with empty value, api return feature containing all properties 
http://localhost:8081/cubeExplorer/rest/header?entry=<file>&metadata=<metadata_value>

##  4. <a name='Getslideofcube-1'></a>Get slide of cube
- Parameter entry : input file (with extension)
- Parameter posZ : slide number
http://localhost:8081/cubeExplorer/rest/slide?entry=<file>&posZ=<slideNumber>

##  5. <a name='Getspectrevalues'></a>Get spectre values 
Method GET

- Parameter entry : input file (with extension)
- Parameter metadata : NAXIS.
- Parameter posX : coordinate X
- Parameter posY : coordinate Y
http://localhost:8081/cubeExplorer/rest/spectrum?entry=<file>&metadata=NAXIS.&posX=<x>&posY=<y>
