import { createBumperCarScene } from '../render/SceneFactory.ts';
import { ThreeRenderer } from '../render/ThreeRenderer.ts';

export class GameApp {
  private readonly root: HTMLElement;
  private readonly renderer: ThreeRenderer;

  public constructor(root: HTMLElement) {
    this.root = root;
    this.root.classList.add('game-root');

    const scene = createBumperCarScene();

    this.renderer = new ThreeRenderer({
      root: this.root,
      scene: scene.scene,
      camera: scene.camera,
    });
  }

  public start(): void {
    this.renderer.start();
  }

  public dispose(): void {
    this.renderer.dispose();
  }
}