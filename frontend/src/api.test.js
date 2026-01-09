import api, { getMyEventDetail, updateEvent, uploadEventThumbnail } from './api';

// Mock axios instance
jest.mock('axios', () => {
    const mockAxios = {
        create: jest.fn(() => ({
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            interceptors: {
                request: { use: jest.fn() },
                response: { use: jest.fn() }
            }
        })),
    };
    return mockAxios;
});

describe('API Utils', () => {
    // We need to access the created instance to mock values
    const apiInstance = api;

    test('getMyEventDetail calls correct endpoint', async () => {
        const mockData = { id: 1, name: 'Event 1' };
        apiInstance.get.mockResolvedValueOnce({ data: mockData });

        const result = await getMyEventDetail(1);

        expect(apiInstance.get).toHaveBeenCalledWith('/organization/events/1');
        expect(result).toEqual(mockData);
    });

    test('updateEvent calls correct endpoint', async () => {
        const mockData = { status: 'ok' };
        apiInstance.put.mockResolvedValueOnce({ data: mockData });

        await updateEvent(1, { name: 'New Name' });

        expect(apiInstance.put).toHaveBeenCalledWith('/organization/events/1', { name: 'New Name' });
    });
});
