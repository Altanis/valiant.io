import Entity from "../Entities/Entity";
import GameServer from "../GameServer";
import Vector from "../Utils/Vector";

/** Class with functions dealing with kinematics. */
export default class PhysicsEngine {
    /** The friction applied to movement. */
    public friction = 0.9;
    /** The server this engine is representing. */
    public server: GameServer;

    constructor(server: GameServer) {
        this.server = server;
    }
    
    public applyFriction(entity: Entity) {
        entity.velocity.scale(this.friction);
    };
    
    public applyElasticCollision(entity1: Entity, entity2: Entity) {
        const angle = entity2.position.angle(entity1.position);
        const totalMass = entity1.mass + entity2.mass;
        
        const ratio1 = entity1.mass / totalMass;
        const ratio2 = entity2.mass / totalMass;
        
        entity1.velocity.subtract(new Vector(Math.cos(angle), Math.sin(angle)).scale(entity1.knockback * ratio2));
        entity2.velocity.add(new Vector(Math.cos(angle), Math.sin(angle)).scale(entity2.knockback * ratio1));
    };

    // hm...
    public applyInelasticCollision(entity1: Entity, entity2: Entity) {
        const angle = entity2.position.angle(entity1.position);
        const totalMass = entity1.mass + entity2.mass;
        
        const ratio1 = entity1.mass / totalMass;
        const ratio2 = entity2.mass / totalMass;
        
        const combinedVelocity = entity1.velocity.clone().scale(ratio1).add(entity2.velocity.clone().scale(ratio2));
        
        entity1.velocity = combinedVelocity;
        entity2.velocity = combinedVelocity;
    };    
};