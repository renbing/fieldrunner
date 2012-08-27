<?xml version="1.0"?>
<!--ActorDescription-->
<ActorName version="1.0" Type="EnemyAmbient" Terrain="Ground">
  <Visual Image="Ambient_Crate.png" Sprite="Ambient_Crate.asc" Doll="" Scale="0.9" RenderQueue="ActorEarly" />
  <Weapon Icon="Icon_Ambient_Landmine.png" Projectile="" ReloadTime="0.1" TechLevels="1" MinimumRange="0" MaximumRange="0.25" FieldOfViewAngle="360" RangeType="Circle" TrackActorsHit="0" WeaponElement="None" Cost-TechLevel1="1" />
  <Script Script="EnemyAmbient_Crate.scr" />
  <Damage DamageLevels="3" Damage-Level1="-300" Damage-Level2="-400" Damage-Level3="-500" />
  <Health AlwaysShowHealth="0" Health="1000" DecayTime="3" ImmuneModifyMovementSpeed="0" ImmuneIncrementalHealthModifier="0" ImmuneModifyDamage="0" ImmuneNamedEffects="" ElementImmunities="1" Immunity1="None" />
</ActorName>