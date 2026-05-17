import { useState, useEffect } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Paper,
  Box,
  Typography,
  Button
} from '@mui/material';
import { Save, Plus } from 'lucide-react';
import type { Chapter } from '../App';

interface WritingEditorProps {
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  selectedChapter: string | null;
  setSelectedChapter: (id: string | null) => void;
}

export function WritingEditor({
  chapters,
  setChapters,
  selectedChapter,
  setSelectedChapter
}: WritingEditorProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const currentChapter = chapters.find(ch => ch.id === selectedChapter);

  useEffect(() => {
    if (currentChapter) {
      setContent(currentChapter.content);
      setTitle(currentChapter.title);
      setNotes(currentChapter.notes);
    }
  }, [currentChapter]);

  const createNewChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: 'Untitled Chapter',
      content: '',
      order: chapters.length,
      wordCount: 0,
      notes: ''
    };
    setChapters([...chapters, newChapter]);
    setSelectedChapter(newChapter.id);
  };

  const saveChapter = () => {
    if (!selectedChapter) return;

    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

    setChapters(chapters.map(ch =>
      ch.id === selectedChapter
        ? { ...ch, title, content, notes, wordCount }
        : ch
    ));
    setLastSaved(new Date());
  };

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

  if (chapters.length === 0) {
    return (
      <Box className="flex items-center justify-center h-full">
        <Paper className="p-8 text-center">
          <Typography variant="h6" className="mb-4">
            No chapters yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={createNewChapter}
          >
            Create First Chapter
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Box className="bg-white border-b border-gray-200 p-4 flex items-center gap-4">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Chapter</InputLabel>
          <Select
            value={selectedChapter || ''}
            label="Chapter"
            onChange={(e) => setSelectedChapter(e.target.value)}
          >
            {chapters.map(ch => (
              <MenuItem key={ch.id} value={ch.id}>
                {ch.title} ({ch.wordCount} words)
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={createNewChapter}
        >
          New Chapter
        </Button>

        <Box className="flex-1" />

        <Typography variant="body2" color="text.secondary">
          {wordCount} words
        </Typography>

        <Button
          variant="contained"
          size="small"
          startIcon={<Save size={16} />}
          onClick={saveChapter}
          disabled={!selectedChapter}
        >
          Save
        </Button>

        {lastSaved && (
          <Typography variant="caption" color="text.secondary">
            Saved {lastSaved.toLocaleTimeString()}
          </Typography>
        )}
      </Box>

      {selectedChapter ? (
        <Box className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <TextField
              fullWidth
              label="Chapter Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
            />

            <TextField
              fullWidth
              multiline
              rows={20}
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              variant="outlined"
              placeholder="Start writing your story..."
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Chapter Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="outlined"
              placeholder="Plot points, reminders, research notes..."
            />
          </div>
        </Box>
      ) : (
        <Box className="flex items-center justify-center flex-1">
          <Typography color="text.secondary">
            Select a chapter to start writing
          </Typography>
        </Box>
      )}
    </div>
  );
}
