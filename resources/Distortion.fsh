//
//  Shader.fsh
//
//  Created by Jamie Gotch on 1/7/10.
//  Copyright 2011 Subatomic Studios, LLC. All rights reserved.
//

precision mediump float;
varying highp vec2 vTexCoord0;

uniform lowp sampler2D uSceneTexture;
uniform lowp sampler2D uDistortionTexture;
	
void main()
{
	vec4 distortionMapSample = texture2D(uDistortionTexture, vTexCoord0);
	distortionMapSample.xyz = (distortionMapSample.xyz * 2.0) - 1.0;
	const float kDistortionStrength = 0.075;
	vec2 distortionTexCoords = vTexCoord0 + (distortionMapSample.xy * kDistortionStrength);
	
	vec4 sceneMapSample = texture2D(uSceneTexture, distortionTexCoords);
	gl_FragColor = vec4(sceneMapSample.rgba);

/*
	// tone mapping
	gl_FragColor = vec4(texture2D(uSceneTexture, vTexCoord0).rgb, 1.0);		
	gl_FragColor.r = texture2D(uDistortionTexture, gl_FragColor.rr).r;
	gl_FragColor.g = texture2D(uDistortionTexture, gl_FragColor.gg).g;
	gl_FragColor.b = texture2D(uDistortionTexture, gl_FragColor.bb).b;
	gl_FragColor.a = 1.0;
	*/
}
