import Entity from "../Entities/Entity";
import Vector from "../Utils/Vector";

/** Class with functions dealing with kinematics. */
export default class PhysicsEngine {
    /** The friction applied to movement. */
    public friction = 0.9;

    applyFriction(entity: Entity) {
        entity.velocity.scale(this.friction);
    }

    /** Elastic collision when both entities are moving. */
    applyElasticCollision(entity1: Entity, entity2: Entity) {
        const totalMass = entity1.mass + entity2.mass;
        const relativeVelocity = { x: entity1.velocity.x - entity2.velocity.x, y: entity1.velocity.y - entity2.velocity.y };
    
        /**
         * Let M = m1 + m2
         
         * $$\vec{v'_1} = \frac{(m_1 - m_2)(\vec{v_1})}{M} + \frac{(2m_2)(\vec{v_2})}{M}$$ 
         */
        entity1.velocity = new Vector(
            (entity1.mass - entity2.mass) / totalMass * entity1.velocity.x - 2 * entity2.mass / totalMass * relativeVelocity.x,
            (entity1.mass - entity2.mass) / totalMass * entity1.velocity.y - 2 * entity2.mass / totalMass * relativeVelocity.y
        );
        entity2.velocity = new Vector(
            (entity2.mass - entity1.mass) / totalMass * entity2.velocity.x + 2 * entity1.mass / totalMass * relativeVelocity.x,
            (entity2.mass - entity1.mass) / totalMass * entity2.velocity.y + 2 * entity1.mass / totalMass * relativeVelocity.y
        );
    }

    /** Knockback irrespective of the entity's velocity. */
    applyKnockback(entity: Entity, direction: Vector, force: number) {
        entity.velocity.add(direction.scale(force / entity.mass));
    }
};