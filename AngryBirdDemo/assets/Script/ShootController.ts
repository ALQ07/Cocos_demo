import { _decorator, BoxCollider2D, Color, Component, EventTouch, Graphics, Node, RigidBody2D, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShootController')
export class ShootController extends Component {
    private startPos: Vec3 = new Vec3();
    private graphics: Graphics = null;
    private isShoot: boolean = false;
    private speed: number = 0;
    private dir: Vec3 = new Vec3();
    private acc: number = 0;
    private shootStartPos: Vec3 = new Vec3();
    private elapsedTime: number = 0;
    private collider: BoxCollider2D = null;
    private rigidBody: RigidBody2D = null;
    private startBoxPos: Vec3[] = [];
    private startNpcPos: Vec3[] = [];
    @property(Node) bird: Node = null;
    @property(Node) npc: Node = null;
    @property(Node) box: Node = null;

    protected onLoad(): void {
        this.graphics = this.getComponent(Graphics);
        this.startPos.set(0, 0, 0);
        this.shootStartPos.set(this.bird.position);
        this.box.children.forEach((child) => {
            this.startBoxPos.push(child.position.clone());
        });
        this.npc.children.forEach((child) => {
            this.startNpcPos.push(child.position.clone());
        });
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this.rigidBody = this.bird.getComponent(RigidBody2D);
        this.collider = this.bird.getComponent(BoxCollider2D);
        if (this.collider) {
            this.collider.on('begin-contact', this.onBirdCollision, this);
        }
    }

    private onBirdCollision(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: any): void {
        this.isShoot = false;
        this.rigidBody.gravityScale = 10;
        this.rigidBody.linearVelocity.set(10, 10);
    }

    private onTouchEnd(event: EventTouch): void {
        this.graphics.clear();
        this.isShoot = true;
        this.elapsedTime = 0;
    }

    private onTouchCancel(event: EventTouch): void {
        this.graphics.clear();
        this.isShoot = true;
        this.elapsedTime = 0;
    }

    private onTouchMove(event: EventTouch): void {
        const delta = event.getDelta();
        const uiTransform = this.node.getComponent(UITransform)!;
        const uiLocation = event.getUILocation();
        console.log('delta', delta);
        const start = this.startPos;
        const end = uiTransform.convertToNodeSpaceAR(new Vec3(uiLocation.x, uiLocation.y, 0));
        this.graphics.clear();
        this.graphics.lineWidth = 2;
        this.graphics.strokeColor = new Color().fromHEX('#ffffffff');
        this.graphics.moveTo(start.x, start.y);
        this.graphics.lineTo(end.x, end.y);
        this.graphics.stroke();

        const dir = new Vec3(end.x - start.x, end.y - start.y, 0).normalize().multiplyScalar(-1);
        const a = -1000;
        const T = 1;
        const dt = 0.02;
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const k = 8;
        const minSpeed = 200;
        const maxSpeed = 1500;
        const speed = Math.min(maxSpeed, Math.max(minSpeed, dist * k));
        this.speed = speed;
        this.dir.set(dir);
        this.acc = a;
        const v0 = new Vec3(dir.x * speed, dir.y * speed, 0);
        for (let t = 0; t <= T; t += dt) {
            const x = start.x + v0.x * t;
            const y = start.y + v0.y * t + 0.5 * a * t * t;
            this.graphics.circle(x, y, 2);
            this.graphics.fill();
        }
    }

    draw() {

    }

    start() {

    }

    update(deltaTime: number) {
        if (this.isShoot) {
            this.elapsedTime += deltaTime;
            const v0x = this.dir.x * this.speed;
            const v0y = this.dir.y * this.speed;
            const x = this.shootStartPos.x + v0x * this.elapsedTime;
            const y = this.shootStartPos.y + v0y * this.elapsedTime + 0.5 * this.acc * this.elapsedTime * this.elapsedTime;
            this.bird.setPosition(x, y, 0);
        }
    }

    reset() {
        this.isShoot = false;
        this.speed = 0;
        this.dir.set(0, 0, 0);
        this.acc = 0;
        this.elapsedTime = 0;
        this.bird.setPosition(this.shootStartPos);
        this.box.children.forEach((child, index) => {
            child.setPosition(this.startBoxPos[index]);
        });
        this.npc.children.forEach((child, index) => {
            child.setPosition(this.startNpcPos[index]);
        });
    }
}


