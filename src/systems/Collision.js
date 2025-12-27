import * as THREE from 'three';

export class Collision {
  constructor() {
    // Reusable box for calculations
    this.tempBox = new THREE.Box3();
  }

  check(player, spawner, playerStrength) {
    const results = {
      gateHits: [],
      enemyHits: [],
      barrelHits: [],
      crateHits: [],
      playerHit: false
    };

    const playerBox = player.boundingBox;

    // Check player-gate collisions
    for (const gate of spawner.gates) {
      if (this.boxIntersects(playerBox, gate.boundingBox)) {
        results.gateHits.push(gate);
      }
    }

    // Check projectile-enemy collisions
    for (const projectile of player.projectiles) {
      const projectileBox = projectile.boundingBox;

      // Check against enemies
      for (const enemy of spawner.enemies) {
        if (this.boxIntersects(projectileBox, enemy.boundingBox)) {
          results.enemyHits.push({
            enemy: enemy,
            projectile: projectile,
            damage: 1 // Each hit does 1 damage
          });
          break; // Projectile can only hit one enemy
        }
      }

      // Check against barrels
      for (const barrel of spawner.barrels) {
        if (this.boxIntersects(projectileBox, barrel.boundingBox)) {
          results.barrelHits.push({
            barrel: barrel,
            projectile: projectile,
            damage: 1
          });
          break;
        }
      }

      // Check against crates
      for (const crate of spawner.crates) {
        if (this.boxIntersects(projectileBox, crate.boundingBox)) {
          results.crateHits.push({
            crate: crate,
            projectile: projectile,
            damage: 1
          });
          break;
        }
      }
    }

    // Check player-enemy collisions (game over condition)
    for (const enemy of spawner.enemies) {
      if (this.boxIntersects(playerBox, enemy.boundingBox)) {
        results.playerHit = true;
        break;
      }
    }

    // Check player-barrel collisions (optional: could damage player)
    for (const barrel of spawner.barrels) {
      if (this.boxIntersects(playerBox, barrel.boundingBox)) {
        // Could add barrel collision behavior here
      }
    }

    return results;
  }

  boxIntersects(box1, box2) {
    return box1.intersectsBox(box2);
  }

  // Sphere-based collision (alternative for more precise detection)
  sphereIntersects(pos1, radius1, pos2, radius2) {
    const distance = pos1.distanceTo(pos2);
    return distance < (radius1 + radius2);
  }
}
