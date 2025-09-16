export async function getLessonData(lessonId: string) {
  try {
    const response = await fetch(`/api/lessons/${lessonId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lesson data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching lesson data:', error);
    throw error;
  }
}
