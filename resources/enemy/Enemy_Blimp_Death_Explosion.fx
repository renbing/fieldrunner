<?xml version="1.0"?>


<!--ParticleSystemDescription-->

<ParticleSystemName version="2">
  <Node name="Air_Death" particleType="Normal" lifetimeValue="1.0" lifetimeVariance="0.0" periodValue="0.0" periodVariance="0.00" lifetimeType="Fixed" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="0" offsetYValue="0" offsetYVariance="0" offsetYInterpolatorType="0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="0" yawVariance="0" yawInterpolatorType="0" pitchValue="0" pitchVariance="0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="1" velocityBasedOrientation="False" trackParentPosition="True" trackParentOrientation="True" enableGraphics="False" enableRibbonTrail="False" enableEmitter="True" emitterIntervalValue="1.0" emitterIntervalVariance="0.00" emitterIntervalInterpolatorType="0" emitterSpawnNumberValue="1" emitterSpawnNumberVariance="0" emitterSpawnNumberInterpolatorType="0" emitterVelocityValue="0.0" emitterVelocityVariance="0.00" emitterVelocityInterpolatorType="0" emitUponDeath="False" emitterSpawnDelayValue="0.0" emitterSpawnDelayVariance="0.0" randomizeVelocityPerParticleInstance="False" emitterShape="0" emitterRevolutions="1.0" fixedSampling="True" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="0" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="0" cameraShakeRangeVariance="0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="Always" createOffscreen="False" emitOffscreen="False" updateOffscreen="False">
    <Node name="Distortion_Ripple" particleType="Normal" lifetimeValue="0.4" lifetimeVariance="0.0" periodValue="0.0" periodVariance="0.00" lifetimeType="Fixed" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="0" offsetYValue="-0.05" offsetYVariance="0.0" offsetYInterpolatorType="0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="0" yawVariance="0" yawInterpolatorType="0" pitchValue="57" pitchVariance="0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="1" velocityBasedOrientation="False" trackParentPosition="True" trackParentOrientation="True" enableGraphics="True" depthSort="False" uniformScaling="False" scaleXValue="0.3" scaleXVariance="0.00" scaleXInterpolatorType="1" scaleXFinalValue="2.00" scaleXFinalVariance="0.0" scaleYValue="0.3" scaleYVariance="0.00" scaleYInterpolatorType="1" scaleYFinalValue="4.0" scaleYFinalVariance="0.0" texCoordUValue="0" texCoordUVariance="0" texCoordUInterpolatorType="0" texCoordVValue="0" texCoordVVariance="0" texCoordVInterpolatorType="0" colorColorKeys="FFFFFFFFFFFF" colorColorVarianceKeys="000000000000" colorOpacityKeys="3400" colorOpacityVarianceKeys="0000" colorCyclic="False" blendMode="alpha" renderMode="ThreeDimensional" anchorX="0.5" anchorY="0.5" appearanceFile="Normal_Torus.png" animationName="" loopAnimation="False" animationFPS="30" renderPass="distortion" enableRibbonTrail="False" enableEmitter="False" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="0" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="15.0" cameraShakeRangeVariance="0.0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="High" createOffscreen="False" emitOffscreen="False" updateOffscreen="False" />
    <Node name="debree" particleType="Normal" lifetimeValue="1.0" lifetimeVariance="0.0" periodValue="0.0" periodVariance="0.00" lifetimeType="Fixed" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="0" offsetYValue="0" offsetYVariance="0" offsetYInterpolatorType="0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="-90" yawVariance="180" yawInterpolatorType="0" pitchValue="0" pitchVariance="0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="1" velocityBasedOrientation="False" trackParentPosition="True" trackParentOrientation="True" enableGraphics="False" enableRibbonTrail="False" enableEmitter="True" emitterIntervalValue="1.0" emitterIntervalVariance="0.00" emitterIntervalInterpolatorType="0" emitterSpawnNumberValue="1" emitterSpawnNumberVariance="0" emitterSpawnNumberInterpolatorType="0" emitterVelocityValue="1.7" emitterVelocityVariance="0.00" emitterVelocityInterpolatorType="0" emitUponDeath="False" emitterSpawnDelayValue="0.0" emitterSpawnDelayVariance="0.0" randomizeVelocityPerParticleInstance="False" emitterShape="0" fixedSampling="False" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="0" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="15.0" cameraShakeRangeVariance="0.0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="Low" createOffscreen="False" emitOffscreen="False" updateOffscreen="False">
      <Node name="Smoke_Emiter_Trail1" particleType="Normal" lifetimeValue="1.5" lifetimeVariance="0.0" periodValue="0.0" periodVariance="0.00" lifetimeType="ParentParticleTagpoint" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="1" offsetXFinalValue="0" offsetXFinalVariance="0" offsetYValue="0" offsetYVariance="0" offsetYInterpolatorType="1" offsetYFinalValue="0" offsetYFinalVariance="0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="-360" yawVariance="720" yawInterpolatorType="0" pitchValue="0" pitchVariance="0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="1" velocityBasedOrientation="False" trackParentPosition="True" trackParentOrientation="True" enableGraphics="True" depthSort="False" uniformScaling="True" scaleXValue="6.0" scaleXVariance="0.00" scaleXInterpolatorType="0" scaleYValue="6.0" scaleYVariance="0.00" scaleYInterpolatorType="0" texCoordUValue="0" texCoordUVariance="0" texCoordUInterpolatorType="0" texCoordVValue="0" texCoordVVariance="0" texCoordVInterpolatorType="0" colorColorKeys="FF8000FF8000" colorColorVarianceKeys="000000000000" colorOpacityKeys="FF00" colorOpacityVarianceKeys="0000" colorCyclic="False" blendMode="alpha" renderMode="ThreeDimensional" anchorX="0.5" anchorY="0.5" appearanceFile="explosion_air.asc" animationName="death" loopAnimation="False" animationFPS="30" renderPass="main" enableRibbonTrail="False" enableEmitter="True" emitterIntervalValue="0.04" emitterIntervalVariance="0.020" emitterIntervalInterpolatorType="0" emitterSpawnNumberValue="1" emitterSpawnNumberVariance="0" emitterSpawnNumberInterpolatorType="0" emitterVelocityValue="0.0" emitterVelocityVariance="0.00" emitterVelocityInterpolatorType="0" emitUponDeath="False" emitterSpawnDelayValue="0.0" emitterSpawnDelayVariance="0.0" randomizeVelocityPerParticleInstance="False" emitterShape="0" fixedSampling="False" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="5" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="0" cameraShakeRangeVariance="0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="Low" createOffscreen="False" emitOffscreen="False" updateOffscreen="False" />
      <Node name="Smoke_Emiter_Trail1" particleType="Normal" lifetimeValue="1.5" lifetimeVariance="0.0" periodValue="0.0" periodVariance="0.00" lifetimeType="ParentParticleTagpoint" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="1" offsetXFinalValue="0" offsetXFinalVariance="0" offsetYValue="0" offsetYVariance="0" offsetYInterpolatorType="1" offsetYFinalValue="0" offsetYFinalVariance="0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="-360" yawVariance="720" yawInterpolatorType="0" pitchValue="0" pitchVariance="0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="1" velocityBasedOrientation="False" trackParentPosition="True" trackParentOrientation="True" enableGraphics="True" depthSort="False" uniformScaling="True" scaleXValue="6.0" scaleXVariance="0.00" scaleXInterpolatorType="0" scaleYValue="6.0" scaleYVariance="0.00" scaleYInterpolatorType="0" texCoordUValue="0" texCoordUVariance="0" texCoordUInterpolatorType="0" texCoordVValue="0" texCoordVVariance="0" texCoordVInterpolatorType="0" colorColorKeys="FF8000FF8000" colorColorVarianceKeys="000000000000" colorOpacityKeys="FF00" colorOpacityVarianceKeys="0000" colorCyclic="False" blendMode="alpha" renderMode="ThreeDimensional" anchorX="0.5" anchorY="0.5" appearanceFile="explosion_air.asc" animationName="death" loopAnimation="False" animationFPS="30" renderPass="main" enableRibbonTrail="False" enableEmitter="True" emitterIntervalValue="0.04" emitterIntervalVariance="0.020" emitterIntervalInterpolatorType="0" emitterSpawnNumberValue="1" emitterSpawnNumberVariance="0" emitterSpawnNumberInterpolatorType="0" emitterVelocityValue="0.0" emitterVelocityVariance="0.00" emitterVelocityInterpolatorType="0" emitUponDeath="False" emitterSpawnDelayValue="0.0" emitterSpawnDelayVariance="0.0" randomizeVelocityPerParticleInstance="False" emitterShape="0" fixedSampling="False" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="5" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="0" cameraShakeRangeVariance="0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="Low" createOffscreen="False" emitOffscreen="False" updateOffscreen="False" />
    </Node>
    <Node name="Explosion_Emiter" particleType="Normal" lifetimeValue="1.0" lifetimeVariance="0.0" periodValue="0.0" periodVariance="0.00" lifetimeType="Fixed" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="0" offsetYValue="0" offsetYVariance="0" offsetYInterpolatorType="0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="0" yawVariance="0" yawInterpolatorType="0" pitchValue="-90.00" pitchVariance="0.0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="1" velocityBasedOrientation="False" trackParentPosition="True" trackParentOrientation="True" enableGraphics="False" enableRibbonTrail="False" enableEmitter="True" emitterIntervalValue="1.0" emitterIntervalVariance="0.00" emitterIntervalInterpolatorType="0" emitterSpawnNumberValue="1" emitterSpawnNumberVariance="0" emitterSpawnNumberInterpolatorType="0" emitterVelocityValue="0.5" emitterVelocityVariance="0.00" emitterVelocityInterpolatorType="0" emitUponDeath="False" emitterSpawnDelayValue="0.0" emitterSpawnDelayVariance="0.0" randomizeVelocityPerParticleInstance="False" emitterShape="0" fixedSampling="False" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="0" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="15.0" cameraShakeRangeVariance="0.0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="Always" createOffscreen="False" emitOffscreen="False" updateOffscreen="False">
      <Node name="Glow_Ground" particleType="Normal" lifetimeValue="0.8" lifetimeVariance="0.0" periodValue="0.0" periodVariance="0.00" lifetimeType="Fixed" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="0" offsetYValue="-0.5" offsetYVariance="0.0" offsetYInterpolatorType="0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="0" yawVariance="0" yawInterpolatorType="0" pitchValue="0" pitchVariance="0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="0" velocityBasedOrientation="False" trackParentPosition="False" trackParentOrientation="False" enableGraphics="True" depthSort="False" uniformScaling="True" scaleXValue="1.0" scaleXVariance="0.00" scaleXInterpolatorType="4" scaleXFinalValue="4" scaleXFinalVariance="0" scaleYValue="1.0" scaleYVariance="0.00" scaleYInterpolatorType="4" scaleYFinalValue="4" scaleYFinalVariance="0" texCoordUValue="0" texCoordUVariance="0" texCoordUInterpolatorType="0" texCoordVValue="0" texCoordVVariance="0" texCoordVInterpolatorType="0" colorOpacityKeyTime1="0.182" colorColorKeys="FAC9C9FFFFFF" colorColorVarianceKeys="000000000000" colorOpacityKeys="002D00" colorOpacityVarianceKeys="000000" colorCyclic="False" blendMode="alphaAdd" renderMode="ThreeDimensional" anchorX="0.5" anchorY="0.5" appearanceFile="Explosion_Glow.png" animationName="" loopAnimation="False" animationFPS="30" renderPass="main" enableRibbonTrail="False" enableEmitter="False" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="0" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="15.0" cameraShakeRangeVariance="0.0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="Medium" createOffscreen="False" emitOffscreen="False" updateOffscreen="False" />
      <Node name="Rays_Ground" particleType="Normal" lifetimeValue="0.3" lifetimeVariance="0.0" periodValue="0.0" periodVariance="0.00" lifetimeType="Fixed" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="0" offsetYValue="0.1" offsetYVariance="0.0" offsetYInterpolatorType="0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="-360" yawVariance="720" yawInterpolatorType="0" pitchValue="0" pitchVariance="0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="0" velocityBasedOrientation="False" trackParentPosition="False" trackParentOrientation="False" enableGraphics="True" depthSort="False" uniformScaling="True" scaleXValue="1.3" scaleXVariance="0.00" scaleXInterpolatorType="4" scaleXFinalValue="4" scaleXFinalVariance="0" scaleYValue="1.3" scaleYVariance="0.00" scaleYInterpolatorType="4" scaleYFinalValue="4" scaleYFinalVariance="0" texCoordUValue="0" texCoordUVariance="0" texCoordUInterpolatorType="0" texCoordVValue="0" texCoordVVariance="0" texCoordVInterpolatorType="0" colorOpacityKeyTime1="0.182" colorColorKeys="FAC9C9FFFFFF" colorColorVarianceKeys="000000000000" colorOpacityKeys="00C600" colorOpacityVarianceKeys="000000" colorCyclic="False" blendMode="alphaAdd" renderMode="ThreeDimensional" anchorX="0.5" anchorY="0.5" appearanceFile="Explosion_Burst.png" animationName="" loopAnimation="False" animationFPS="30" renderPass="main" enableRibbonTrail="False" enableEmitter="False" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="0" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="15.0" cameraShakeRangeVariance="0.0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="Medium" createOffscreen="False" emitOffscreen="False" updateOffscreen="False" />
      <Node name="Animated_Explosion" particleType="Normal" lifetimeValue="1.3" lifetimeVariance="0.20" periodValue="0.0" periodVariance="0.00" lifetimeType="Fixed" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="0" offsetYValue="0" offsetYVariance="0" offsetYInterpolatorType="2" offsetYFinalValue="0" offsetYFinalVariance="0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="-10" yawVariance="20" yawInterpolatorType="0" pitchValue="0" pitchVariance="0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="0" velocityBasedOrientation="False" trackParentPosition="False" trackParentOrientation="False" enableGraphics="True" depthSort="False" uniformScaling="True" scaleXValue="9.8" scaleXVariance="0.40" scaleXInterpolatorType="0" scaleYValue="9.8" scaleYVariance="0.40" scaleYInterpolatorType="0" texCoordUValue="0" texCoordUVariance="0" texCoordUInterpolatorType="0" texCoordVValue="0" texCoordVVariance="0" texCoordVInterpolatorType="0" colorOpacityKeyTime1="0.343" colorOpacityKeyTime2="0.879" colorColorKeys="E0917CECA977" colorColorVarianceKeys="000000000000" colorOpacityKeys="FFFF0000" colorOpacityVarianceKeys="00000000" colorCyclic="False" blendMode="alpha" renderMode="ThreeDimensional" anchorX="0.5" anchorY="0.5" appearanceFile="explosion_air.asc" animationName="death" loopAnimation="False" animationFPS="30" renderPass="main" enableRibbonTrail="False" enableEmitter="False" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="0" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="15.0" cameraShakeRangeVariance="0.0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="Always" createOffscreen="False" emitOffscreen="False" updateOffscreen="False" />
      <Node name="Debris" particleType="Normal" lifetimeValue="0.3" lifetimeVariance="0.0" periodValue="0.0" periodVariance="0.00" lifetimeType="Fixed" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="0" offsetYValue="0" offsetYVariance="0" offsetYInterpolatorType="0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="-360" yawVariance="720" yawInterpolatorType="0" pitchValue="0" pitchVariance="0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="0" velocityBasedOrientation="False" trackParentPosition="False" trackParentOrientation="False" enableGraphics="True" depthSort="False" uniformScaling="True" scaleXValue="0.0" scaleXVariance="0.00" scaleXInterpolatorType="2" scaleXFinalValue="4.7" scaleXFinalVariance="0.60" scaleYValue="0.0" scaleYVariance="0.00" scaleYInterpolatorType="2" scaleYFinalValue="4.7" scaleYFinalVariance="0.60" texCoordUValue="0" texCoordUVariance="0" texCoordUInterpolatorType="0" texCoordVValue="0" texCoordVVariance="0" texCoordVInterpolatorType="0" colorColorKeys="FFAD33E76618" colorColorVarianceKeys="000000000000" colorOpacityKeys="FF00" colorOpacityVarianceKeys="0000" colorCyclic="False" blendMode="alphaAdd" renderMode="ThreeDimensional" anchorX="0.5" anchorY="0.5" appearanceFile="rad_orbs.png" animationName="" loopAnimation="False" animationFPS="30" renderPass="main" enableRibbonTrail="False" enableEmitter="False" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="0" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="15.0" cameraShakeRangeVariance="0.0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="Low" createOffscreen="False" emitOffscreen="False" updateOffscreen="False" />
      <Node name="Glow_Round" particleType="Normal" lifetimeValue="0.6" lifetimeVariance="0.0" periodValue="0.0" periodVariance="0.00" lifetimeType="Fixed" tesselateSourceToTarget="False" sourceToTargetSnapToCardinals="False" offsetXValue="0" offsetXVariance="0" offsetXInterpolatorType="0" offsetYValue="0" offsetYVariance="0" offsetYInterpolatorType="1" offsetYFinalValue="0" offsetYFinalVariance="0" offsetZValue="0" offsetZVariance="0" offsetZInterpolatorType="0" yawValue="0" yawVariance="0" yawInterpolatorType="0" pitchValue="0" pitchVariance="0" pitchInterpolatorType="0" rollValue="0" rollVariance="0" rollInterpolatorType="0" coordinateSystem="0" velocityBasedOrientation="False" trackParentPosition="False" trackParentOrientation="False" enableGraphics="True" depthSort="False" uniformScaling="True" scaleXValue="2.0" scaleXVariance="0.00" scaleXInterpolatorType="4" scaleXFinalValue="3" scaleXFinalVariance="0" scaleYValue="2.0" scaleYVariance="0.00" scaleYInterpolatorType="4" scaleYFinalValue="3" scaleYFinalVariance="0" texCoordUValue="0" texCoordUVariance="0" texCoordUInterpolatorType="0" texCoordVValue="0" texCoordVVariance="0" texCoordVInterpolatorType="0" colorColorKeyTime1="0.505" colorOpacityKeyTime1="0.232" colorOpacityKeyTime2="0.707" colorColorKeys="FFFF00FBA44DFF8000" colorColorVarianceKeys="000000000000000000" colorOpacityKeys="FFFF9300" colorOpacityVarianceKeys="00000000" colorCyclic="False" blendMode="alphaAdd" renderMode="ThreeDimensional" anchorX="0.5" anchorY="0.5" appearanceFile="Explosion_Glow.png" animationName="" loopAnimation="False" animationFPS="30" renderPass="main" enableRibbonTrail="False" enableEmitter="False" enableSoundEffect="False" massValue="0" massVariance="0" aeroDynamicsValue="0" aeroDynamicsVariance="0" dampingValue="0" dampingVariance="0" cameraShakeValue="0" cameraShakeVariance="0" cameraShakeRangeValue="15.0" cameraShakeRangeVariance="0.0" spinAroundCenterValue="0" spinAroundCenterVariance="0" spinAroundCenterInterpolatorType="0" spinAroundPivotValue="0" spinAroundPivotVariance="0" spinAroundPivotInterpolatorType="0" collidesWithTerrain="False" applyRandomVelocity="False" priority="Always" createOffscreen="False" emitOffscreen="False" updateOffscreen="False" />
    </Node>
  </Node>
</ParticleSystemName>