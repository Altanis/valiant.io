import Entity from "../Entities/Entity";
import Vector from "../Utils/Vector";

/** Class with functions dealing with kinematics. */
export default class PhysicsEngine {
    /** The friction applied to movement. */
    public friction = 0.9;
    
    public applyFriction(entity: Entity) {
        entity.velocity.scale(this.friction);
    }
    
    /*public applyElasticCollision(entity1: Entity, entity2: Entity) {
        const angle = entity2.position.angle(entity1.position);

        entity1.velocity.add(new Vector(Math.cos(angle), Math.sin(angle)).scale(entity1.knockback));
        entity2.velocity.add(new Vector(Math.cos(angle), Math.sin(angle)).scale(entity2.knockback));

        console.log("victim", entity1.velocity);
        console.log("collider", entity2.velocity);
    }*/

    public applyElasticCollision(entity1: Entity, entity2: Entity) {
        const angle = entity2.position.angle(entity1.position);
        const push = new Vector(Math.cos(angle), Math.sin(angle));
    
        const m1 = entity1.mass;
        const m2 = entity2.mass;
        const u1 = entity1.velocity.clone();
        const u2 = entity2.velocity.clone();
    
        const v1 = u1.clone().subtract(push.clone().scale(2 * m2 / (m1 + m2) * u1.clone().subtract(u2.clone()).dot(push.clone())));
        const v2 = u2.clone().add(push.clone().scale(2 * m1 / (m1 + m2) * u1.clone().subtract(u2.clone()).dot(push.clone())));
    
        entity1.velocity = v1.clone().scale(entity1.knockback);
        entity2.velocity = v2.clone().scale(entity2.knockback);
    
        console.log("victim", entity1.velocity);
        console.log("collider", entity2.velocity);
    }    
};

