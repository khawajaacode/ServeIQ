type EventCallback = (event: string, payload: unknown) => void;

const listeners = new Map<string, Set<EventCallback>>();

export const publish = (restaurantID: string, event: string, payload: unknown) => {
	for (const listener of listeners.get(restaurantID) ?? []) listener(event, payload);
};

export const subscribe = (restaurantID: string, callback: EventCallback) => {
	const restaurantListeners = listeners.get(restaurantID) ?? new Set<EventCallback>();
	restaurantListeners.add(callback);
	listeners.set(restaurantID, restaurantListeners);
	return () => {
		restaurantListeners.delete(callback);
		if (!restaurantListeners.size) listeners.delete(restaurantID);
	};
};
