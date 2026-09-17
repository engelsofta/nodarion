/** Revision-aware transport for Nodarion's panel state. */
export class NodarionStateClient {
  constructor(hass, onUpdate) {
    this.hass = hass;
    this.onUpdate = onUpdate;
    this.state = null;
    this.revision = 0;
    this.unsubscribe = null;
    this.stopped = false;
  }

  async start() {
    try {
      const unsubscribe = await this.hass.connection.subscribeMessage(
        (message) => this._apply(message),
        { type: "nodarion/subscribe" },
      );
      if (this.stopped) unsubscribe();
      else this.unsubscribe = unsubscribe;
    } catch (_error) {
      // REST remains available for older HA frontends and reconnect windows.
      await this.refresh();
    }
  }

  stop() {
    this.stopped = true;
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  async refresh() {
    const state = await this.hass.callApi("GET", "nodarion/monitor");
    this.state = state;
    this.onUpdate(state, new Set([
      "preferences", "lifecycle", "status", "participants", "events", "alerts",
    ]));
    return state;
  }

  async mutate(payload) {
    const state = await this.hass.callApi("POST", "nodarion/monitor", payload);
    this.state = state;
    this.onUpdate(state, new Set([
      "preferences", "lifecycle", "status", "participants", "events", "alerts",
    ]));
    return state;
  }

  _apply(message) {
    if (!message?.patch || Number(message.revision) <= this.revision) return;
    this.revision = Number(message.revision);
    const changed = new Set(Object.keys(message.patch));
    this.state = {
      ...(this.state || {}),
      ...Object.assign({}, ...Object.values(message.patch)),
    };
    this.onUpdate(this.state, changed);
  }
}
