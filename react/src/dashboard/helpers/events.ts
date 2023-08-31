function subscribe(eventName: string, listener: EventListenerOrEventListenerObject) {
    document.addEventListener(eventName, listener);
}

function unsubscribe(eventName: string, listener: EventListenerOrEventListenerObject) {
    document.removeEventListener(eventName, listener);
}

function publish(eventName: string, data = {}) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
}

export default { publish, subscribe, unsubscribe };
