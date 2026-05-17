import { useState } from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { Trash2, Edit, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import type { Chapter } from '../App';

interface ChapterManagerProps {
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  onSelectChapter: (id: string) => void;
}

export function ChapterManager({
  chapters,
  setChapters,
  onSelectChapter
}: ChapterManagerProps) {
  const [editDialog, setEditDialog] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

  const addChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: 'New Chapter',
      content: '',
      order: chapters.length,
      wordCount: 0,
      notes: ''
    };
    setChapters([...chapters, newChapter]);
  };

  const deleteChapter = (id: string) => {
    const filtered = chapters.filter(ch => ch.id !== id);
    const reordered = filtered.map((ch, index) => ({ ...ch, order: index }));
    setChapters(reordered);
  };

  const moveChapter = (id: string, direction: 'up' | 'down') => {
    const index = sortedChapters.findIndex(ch => ch.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sortedChapters.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newOrder = [...sortedChapters];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];

    const reordered = newOrder.map((ch, idx) => ({ ...ch, order: idx }));
    setChapters(reordered);
  };

  const openEditDialog = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setEditTitle(chapter.title);
    setEditDialog(true);
  };

  const saveEdit = () => {
    if (!editingChapter) return;

    setChapters(chapters.map(ch =>
      ch.id === editingChapter.id ? { ...ch, title: editTitle } : ch
    ));
    setEditDialog(false);
  };

  const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Box className="mb-6 flex items-center justify-between">
        <div>
          <Typography variant="h5" className="mb-2">
            Chapter Organization
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {chapters.length} chapters • {totalWords} total words
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={addChapter}
        >
          Add Chapter
        </Button>
      </Box>

      {chapters.length === 0 ? (
        <Paper className="p-8 text-center">
          <Typography variant="h6" color="text.secondary" className="mb-4">
            No chapters yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={addChapter}
          >
            Create First Chapter
          </Button>
        </Paper>
      ) : (
        <Paper>
          <List>
            {sortedChapters.map((chapter, index) => (
              <ListItem
                key={chapter.id}
                sx={{
                  borderBottom: index < sortedChapters.length - 1 ? '1px solid #e0e0e0' : 'none',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
                }}
              >
                <Box className="flex items-center gap-2 mr-4">
                  <IconButton
                    size="small"
                    onClick={() => moveChapter(chapter.id, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => moveChapter(chapter.id, 'down')}
                    disabled={index === sortedChapters.length - 1}
                  >
                    <ChevronDown size={18} />
                  </IconButton>
                </Box>

                <ListItemText
                  primary={
                    <Box className="flex items-center gap-2">
                      <Chip
                        label={index + 1}
                        size="small"
                        color="primary"
                        sx={{ width: 40 }}
                      />
                      <Typography variant="subtitle1">
                        {chapter.title}
                      </Typography>
                    </Box>
                  }
                  secondary={`${chapter.wordCount} words`}
                  onClick={() => onSelectChapter(chapter.id)}
                  sx={{ cursor: 'pointer', flex: 1 }}
                />

                <Box className="flex gap-1">
                  <IconButton
                    size="small"
                    onClick={() => openEditDialog(chapter)}
                  >
                    <Edit size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => deleteChapter(chapter.id)}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit Chapter</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Chapter Title"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={saveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
