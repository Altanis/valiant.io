import Entity from "../Entities/Entity";
import Vector from "../Utils/Vector";

/** Class with functions dealing with kinematics. */
export default class PhysicsEngine {
    /** The friction applied to movement. */
    public friction = 0.9;
    
    public applyFriction(entity: Entity) {
        entity.velocity.scale(this.friction);
    }
    
    public applyElasticCollision(entity1: Entity, entity2: Entity) {
        const angle = entity2.position.angle(entity1.position);
        const push = new Vector(Math.cos(angle), Math.sin(angle));

        entity1.velocity.add(push).scale(entity1.knockback);
        entity2.velocity.subtract(push).scale(entity2.knockback);
    }
};