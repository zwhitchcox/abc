// Stubbed LiteFS server utils since we removed LiteFS
// This ensures existing code that imports these doesn't break immediately

export async function getInstanceInfo() {
	return {
		currentIsPrimary: true,
		primaryInstance: 'localhost',
		currentInstance: 'localhost',
	}
}

export function getInstanceInfoSync() {
	return {
		currentIsPrimary: true,
		primaryInstance: 'localhost',
		currentInstance: 'localhost',
	}
}

export async function getAllInstances(): Promise<Record<string, string>> {
	return {
		localhost: 'local',
	}
}

export function getInternalInstanceDomain(instance: string) {
	return `http://${instance}:${process.env.INTERNAL_PORT || 8080}`
}

export async function ensurePrimary() {
	return
}

export async function ensureInstance(_instance: string) {
	return
}
