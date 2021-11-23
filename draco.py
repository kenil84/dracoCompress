import os
import sys

path = sys.argv[1]
print(path)
# r=root, d=directories, f = files
for r, d, f in os.walk(path):
	for file in f:
		if file.endswith('.glb'):
			outfilename = file.replace(".glb", "_draco.glb")
			filespath = os.path.join(r, file)
			outfilepath = os.path.join(r, outfilename)
			print(outfilename)
			os.system('npx gltf-pipeline -i '+filespath+' -d --draco.compressionLevel 7 -o '+outfilepath)
