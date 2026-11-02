// Jugador en primera persona: orientación, movimiento y colisiones contra rectángulos.
import { clamp } from './helpers.js';

const RADIUS = 0.3;

export function createPlayer({ camera, input }) {
  const player = {
    yaw: 0,
    pitch: 0,
    speed: 2.5,
    eye: 1.65,
    frozen: true,            // true = no se mueve ni mira (menús, diálogos modales, pantalla de inicio)
    bounds: { minX: -5.4, maxX: 5.4, minZ: -5.4, maxZ: 5.4 },
    obstacles: [],           // [minX, maxX, minZ, maxZ]
    bob: 0,
    position: camera.position,

    setBounds(b) { player.bounds = { ...player.bounds, ...b }; },
    addObstacle(rect) { player.obstacles.push(rect); },
    clearObstacles() { player.obstacles.length = 0; },

    teleport(x, z, yaw = 0, pitch = 0) {
      camera.position.set(x, player.eye, z);
      player.yaw = yaw; player.pitch = pitch;
      camera.rotation.set(pitch, yaw, 0);
    },

    look(dyaw, dpitch) {
      if (player.frozen) return;
      player.yaw += dyaw;
      player.pitch = clamp(player.pitch + dpitch, -1.3, 1.3);
    },

    // Rayo desde los ojos hacia donde mira.
    forwardRay(length) {
      const B = window.BABYLON;
      const dir = new B.Vector3(
        Math.sin(player.yaw) * Math.cos(player.pitch),
        -Math.sin(player.pitch),
        Math.cos(player.yaw) * Math.cos(player.pitch)
      );
      return new B.Ray(camera.position.clone(), dir, length);
    },

    update(dt) {
      if (!player.frozen) {
        const m = input.getMove();
        const len = Math.hypot(m.x, m.y);
        if (len > 0.05) {
          const s = player.speed * dt, sy = Math.sin(player.yaw), cy = Math.cos(player.yaw);
          camera.position.x += (sy * m.y + cy * m.x) * s;
          camera.position.z += (cy * m.y - sy * m.x) * s;
          resolve(camera.position, player);
          player.bob += dt * 8 * Math.min(1, len);
        }
        camera.position.y = player.eye + Math.sin(player.bob) * 0.018;
      }
      camera.rotation.x = player.pitch;
      camera.rotation.y = player.yaw;
    }
  };
  return player;
}

function resolve(p, player) {
  const b = player.bounds;
  p.x = clamp(p.x, b.minX, b.maxX);
  p.z = clamp(p.z, b.minZ, b.maxZ);
  for (const o of player.obstacles) {
    const minX = o[0] - RADIUS, maxX = o[1] + RADIUS, minZ = o[2] - RADIUS, maxZ = o[3] + RADIUS;
    if (p.x > minX && p.x < maxX && p.z > minZ && p.z < maxZ) {
      const dl = p.x - minX, dr = maxX - p.x, db = p.z - minZ, dt = maxZ - p.z;
      const m = Math.min(dl, dr, db, dt);
      if (m === dl) p.x = minX; else if (m === dr) p.x = maxX; else if (m === db) p.z = minZ; else p.z = maxZ;
    }
  }
}
