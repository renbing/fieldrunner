<?xml version="1.0"?>


<!--ParticleSystemDescription-->

<ParticleSystemName version="2" drawsOverGround="True">
  <Node name="Nuke_Launch" particleType="Normal" lifetimeValue="1.0" lifetimeVariance="0.0" periodValue="0.0" periodVariance="0.0" lifetimeType="Fixed" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="0" offsetYValue="0" offsetYVariance="0" offsetYInterpolatorType="0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="0" yawVariance="0" yawInterpolatorType="0" pitchValue="0" pitchVariance="0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="1" velocityBasedOrientation="False" trackParentPosition="True" trackParentOrientation="True" enableGraphics="False" enableRibbonTrail="False" enableEmitter="True" emitterIntervalValue="1.0" emitterIntervalVariance="0.0" emitterIntervalInterpolatorType="0" emitterSpawnNumberValue="1" emitterSpawnNumberVariance="0" emitterSpawnNumberInterpolatorType="0" emitterVelocityValue="0.0" emitterVelocityVariance="0.0" emitterVelocityInterpolatorType="0" emitUponDeath="False" emitterSpawnDelayValue="0" emitterSpawnDelayVariance="0" randomizeVelocityPerParticleInstance="False" emitterShape="0" fixedSampling="False" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="0" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="15.0" cameraShakeRangeVariance="0.0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="Always" createOffscreen="False" emitOffscreen="False" updateOffscreen="False">
    <Node name="Smoke_Puff" particleType="Normal" lifetimeValue="1.8" lifetimeVariance="0.0" periodValue="0.0" periodVariance="0.0" lifetimeType="Fixed" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="0" offsetYValue="0" offsetYVariance="0" offsetYInterpolatorType="1" offsetYFinalValue="0.2" offsetYFinalVariance="0.0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="0" yawVariance="0" yawInterpolatorType="0" pitchValue="0" pitchVariance="0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="1" velocityBasedOrientation="False" trackParentPosition="True" trackParentOrientation="True" enableGraphics="True" depthSort="False" uniformScaling="False" scaleXValue="0.6" scaleXVariance="0.0" scaleXInterpolatorType="2" scaleXFinalValue="3" scaleXFinalVariance="0" scaleYValue="2" scaleYVariance="0" scaleYInterpolatorType="2" scaleYFinalValue="2.2" scaleYFinalVariance="0.0" texCoordUValue="0" texCoordUVariance="0" texCoordUInterpolatorType="0" texCoordVValue="0" texCoordVVariance="0" texCoordVInterpolatorType="0" colorColorKeyTime1="0.343" colorOpacityKeyTime1="0.111" colorOpacityKeyTime2="0.838" colorColorKeys="EF540AE9DECFFFFFFF" colorColorVarianceKeys="000000000000000000" colorOpacityKeys="3DFFFF00" colorOpacityVarianceKeys="00000000" colorCyclic="False" blendMode="alphaAdd" renderMode="ThreeDimensional" anchorX="0.5" anchorY="0.5" appearanceFile="explosion_1.asc" animationName="death" loopAnimation="False" animationFPS="25.0" renderPass="main" enableRibbonTrail="False" enableEmitter="False" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="0" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="15.0" cameraShakeRangeVariance="0.0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="Medium" createOffscreen="False" emitOffscreen="False" updateOffscreen="False" />
    <Node name="Glow_Flare_X" particleType="Normal" lifetimeValue="0.7" lifetimeVariance="0.0" periodValue="0.0" periodVariance="0.0" lifetimeType="Fixed" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="0" offsetYValue="0" offsetYVariance="0" offsetYInterpolatorType="0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="0" yawVariance="0" yawInterpolatorType="0" pitchValue="0" pitchVariance="0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="0" velocityBasedOrientation="False" trackParentPosition="False" trackParentOrientation="False" enableGraphics="True" depthSort="False" uniformScaling="False" scaleXValue="-0.8" scaleXVariance="2.00" scaleXInterpolatorType="2" scaleXFinalValue="3" scaleXFinalVariance="0" scaleYValue="-0.54" scaleYVariance="1.40" scaleYInterpolatorType="2" scaleYFinalValue="2.3" scaleYFinalVariance="0.0" texCoordUValue="0" texCoordUVariance="0" texCoordUInterpolatorType="0" texCoordVValue="0" texCoordVVariance="0" texCoordVInterpolatorType="0" colorOpacityKeyTime1="0.455" colorColorKeys="FFFFFFFFFFFF" colorColorVarianceKeys="000000000000" colorOpacityKeys="00FF00" colorOpacityVarianceKeys="000000" colorCyclic="False" blendMode="alphaAdd" renderMode="ThreeDimensional" anchorX="0.5" anchorY="0.5" appearanceFile="Explosion_Glow.png" animationName="" loopAnimation="False" animationFPS="30" renderPass="main" enableRibbonTrail="False" enableEmitter="False" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="0" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="15.0" cameraShakeRangeVariance="0.0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="Low" createOffscreen="False" emitOffscreen="False" updateOffscreen="False" />
    <Node name="Glow_Flare_Y" particleType="Normal" lifetimeValue="0.4" lifetimeVariance="0.0" periodValue="0.0" periodVariance="0.0" lifetimeType="Fixed" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="0" offsetYValue="0.3" offsetYVariance="0.0" offsetYInterpolatorType="1" offsetYFinalValue="0.3" offsetYFinalVariance="0.0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="0" yawVariance="0" yawInterpolatorType="0" pitchValue="0" pitchVariance="0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="0" velocityBasedOrientation="False" trackParentPosition="False" trackParentOrientation="False" enableGraphics="True" depthSort="False" uniformScaling="False" scaleXValue="-0.10" scaleXVariance="0.200" scaleXInterpolatorType="2" scaleXFinalValue="1.6" scaleXFinalVariance="0.0" scaleYValue="-0.5" scaleYVariance="1.00" scaleYInterpolatorType="2" scaleYFinalValue="2" scaleYFinalVariance="0" texCoordUValue="0" texCoordUVariance="0" texCoordUInterpolatorType="0" texCoordVValue="0" texCoordVVariance="0" texCoordVInterpolatorType="0" colorOpacityKeyTime1="0.455" colorColorKeys="FFFFFFFFFFFF" colorColorVarianceKeys="000000000000" colorOpacityKeys="00FF00" colorOpacityVarianceKeys="000000" colorCyclic="False" blendMode="alphaAdd" renderMode="ThreeDimensional" anchorX="0.5" anchorY="0.5" appearanceFile="Explosion_Glow.png" animationName="" loopAnimation="False" animationFPS="30" renderPass="main" enableRibbonTrail="False" enableEmitter="False" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="0" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="15.0" cameraShakeRangeVariance="0.0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="Low" createOffscreen="False" emitOffscreen="False" updateOffscreen="False" />
  </Node>
</ParticleSystemName>