//
//  Shader.vsh
//
//  Created by Jamie Gotch on 1/7/10.
//  Copyright 2010 Subatomic Studios, LLC. All rights reserved.
//

//#define kEnableVertexColor
//#define kEnableTexCoord0
//#define kEnableTextureEnvironmentModeAdd

attribute vec4 aPosition;
attribute vec4 aColor;
attribute vec2 aTexCoord0;

varying lowp vec4 vColor;
varying highp vec2 vTexCoord0;

//uniform float translate;
uniform mat4 uModelViewProjectionMatrix;

void main()
{	
    gl_Position = uModelViewProjectionMatrix * vec4(aPosition.xyz, 1.0);

#ifdef kEnableVertexColor
	vColor = aColor;
#endif

#ifdef kEnableTexCoord0
	vTexCoord0 = aTexCoord0;
#endif
}
