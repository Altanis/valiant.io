import Entity from "../Entities/Entity";
import Vector from "../Utils/Vector";

/** Class with functions dealing with kinematics. */
export default class PhysicsEngine {
    /** The friction applied to movement. */
    public friction = 0.9;
    
    applyFriction(entity: Entity) {
        entity.velocity.scale(this.friction);
    }

    public applyElasticCollision(entity1: Entity, entity2: Entity) {
        /**
         * $$v_{1x}' = \frac{(m_1 - m2) v{1x} + 2 m2 v{2x} \cos{\theta}}{m_1 + m2}$$
            $$v{1y}' = \frac{(m_1 - m2) v{1y} + 2 m2 v{2y} \cos{\theta}}{m_1 + m2}$$
            $$v{2x}' = \frac{(m_2 - m1) v{2x} + 2 m1 v{1x} \cos{\theta}}{m_1 + m2}$$
            $$v{2y}' = \frac{(m_2 - m1) v{2y} + 2 m1 v{1y} \cos{\theta}}{m_1 + m_2}$$
         */
        const theta = entity1.velocity.dot(entity2.velocity) / ((entity1.velocity.magnitude * entity2.velocity.magnitude) || 1);
        const m1 = entity1.mass;
        const m2 = entity2.mass;
        const v1x = entity1.velocity.x || ((entity1.mass + entity2.mass) / 2);
        const v1y = entity1.velocity.y || ((entity1.mass + entity2.mass) / 2);
        const v2x = entity2.velocity.x || ((entity1.mass + entity2.mass) / 2);
        const v2y = entity2.velocity.y || ((entity1.mass + entity2.mass) / 2);

        const v1xPrime = ((m1 - m2) * v1x + 2 * m2 * v2x * Math.cos(theta)) / (m1 + m2);
        const v1yPrime = ((m1 - m2) * v1y + 2 * m2 * v2y * Math.cos(theta)) / (m1 + m2);
        const v2xPrime = ((m2 - m1) * v2x + 2 * m1 * v1x * Math.cos(theta)) / (m1 + m2);
        const v2yPrime = ((m2 - m1) * v2y + 2 * m1 * v1y * Math.cos(theta)) / (m1 + m2);

        entity2.velocity = new Vector(v1xPrime, v1yPrime).scale(entity2.knockback);
        entity1.velocity = new Vector(v2xPrime, v2yPrime).scale(entity1.knockback);

        console.log("V!", entity1.velocity, entity2.velocity);
    }
};