export class GameApp {
  private readonly root: HTMLElement;

  public constructor(root: HTMLElement) {
    this.root = root;
  }

  public start(): void {
    this.root.innerHTML = `
      <main class="app">
        <section class="hero">
          <p class="eyebrow">Atlas / Bumper Car Prototype</p>
          <h1>Carritos Chocadores</h1>
          
        </section>
      </main>
    `;
  }
}