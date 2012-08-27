//
//  Shader.fsh
//
//  Created by Jamie Gotch on 1/7/10.
//  Copyright 2010 Subatomic Studios, LLC. All rights reserved.
//

//#define kEnableVertexColor
//#define kEnableTexCoord0
//#define kEnableTextureEnvironmentModeAdd

precision lowp float;

varying lowp vec4 vColor;
varying highp vec2 vTexCoord0;

uniform lowp sampler2D uTexture0;
uniform lowp vec4 uUniformColor;

void main()
{
	// Create a temporary output value at low precision to maximize performance.
	// Do not write directly into gl_FragColor until the final color has been 
	// computed as it will drastically degrade performance due to the precision 
	// conversions.
	lowp vec4 tempOutput;

#ifdef kEnableTexCoord0

	tempOutput = texture2D(uTexture0, vTexCoord0);
	
	#ifdef kEnableVertexColor
		#ifdef kEnableTextureEnvironmentModeAdd
			tempOutput.rgb += vColor.rgb;
			tempOutput.a *= vColor.a;
		#else
			tempOutput *= vColor;
		#endif
	#endif

	tempOutput *= uUniformColor;

#else 

	#ifdef kEnableVertexColor
		tempOutput = vColor * uUniformColor;
	#else
		// Just uniform color.
		tempOutput = uUniformColor;
	#endif
	
#endif

	gl_FragColor = tempOutput;
}
