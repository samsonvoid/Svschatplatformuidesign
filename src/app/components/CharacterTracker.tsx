import { useState } from 'react';
import {
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import { Plus, Trash2, Edit } from 'lucide-react';
import type { Character, Chapter } from '../App';

interface CharacterTrackerProps {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  chapters: Chapter[];
}

export function CharacterTracker({
  characters,
  setCharacters,
  chapters
}: CharacterTrackerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    arc: '',
    traits: [] as string[],
    appearances: [] as string[]
  });
  const [traitInput, setTraitInput] = useState('');

  const openDialog = (character?: Character) => {
    if (character) {
      setEditingCharacter(character);
      setFormData({
        name: character.name,
        role: character.role,
        description: character.description,
        arc: character.arc,
        traits: character.traits,
        appearances: character.appearances
      });
    } else {
      setEditingCharacter(null);
      setFormData({
        name: '',
        role: '',
        description: '',
        arc: '',
        traits: [],
        appearances: []
      });
    }
    setDialogOpen(true);
  };

  const saveCharacter = () => {
    if (!formData.name.trim()) return;

    const characterData = {
      id: editingCharacter?.id || Date.now().toString(),
      ...formData
    };

    if (editingCharacter) {
      setCharacters(characters.map(ch =>
        ch.id === editingCharacter.id ? characterData : ch
      ));
    } else {
      setCharacters([...characters, characterData]);
    }

    setDialogOpen(false);
  };

  const deleteCharacter = (id: string) => {
    setCharacters(characters.filter(ch => ch.id !== id));
  };

  const addTrait = () => {
    if (traitInput.trim() && !formData.traits.includes(traitInput.trim())) {
      setFormData({
        ...formData,
        traits: [...formData.traits, traitInput.trim()]
      });
      setTraitInput('');
    }
  };

  const removeTrait = (trait: string) => {
    setFormData({
      ...formData,
      traits: formData.traits.filter(t => t !== trait)
    });
  };

  const handleAppearancesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      appearances: typeof value === 'string' ? value.split(',') : value
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Box className="mb-6 flex items-center justify-between">
        <div>
          <Typography variant="h5" className="mb-2">
            Character Development
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your characters and their development arcs
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => openDialog()}
        >
          Add Character
        </Button>
      </Box>

      {characters.length === 0 ? (
        <Paper className="p-8 text-center">
          <Typography variant="h6" color="text.secondary" className="mb-4">
            No characters yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => openDialog()}
          >
            Create First Character
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {characters.map((character) => {
            const appearanceCount = character.appearances.length;
            const chapterNames = character.appearances
              .map(id => chapters.find(ch => ch.id === id)?.title)
              .filter(Boolean);

            return (
              <Grid item xs={12} md={6} lg={4} key={character.id}>
                <Card>
                  <CardContent>
                    <Box className="flex items-start justify-between mb-2">
                      <Typography variant="h6" component="div">
                        {character.name}
                      </Typography>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => openDialog(character)}
                        >
                          <Edit size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteCharacter(character.id)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Box>
                    </Box>

                    <Chip
                      label={character.role || 'No role'}
                      size="small"
                      color="primary"
                      className="mb-3"
                    />

                    {character.description && (
                      <Typography variant="body2" color="text.secondary" className="mb-2">
                        {character.description}
                      </Typography>
                    )}

                    {character.arc && (
                      <Box className="mb-2">
                        <Typography variant="caption" color="text.secondary">
                          Character Arc:
                        </Typography>
                        <Typography variant="body2">
                          {character.arc}
                        </Typography>
                      </Box>
                    )}

                    {character.traits.length > 0 && (
                      <Box className="mb-2">
                        <Typography variant="caption" color="text.secondary" className="mb-1 block">
                          Traits:
                        </Typography>
                        <Box className="flex flex-wrap gap-1">
                          {character.traits.map((trait, idx) => (
                            <Chip key={idx} label={trait} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Typography variant="caption" color="text.secondary" className="mt-2 block">
                      Appears in {appearanceCount} {appearanceCount === 1 ? 'chapter' : 'chapters'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCharacter ? 'Edit Character' : 'Add Character'}
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Role"
              placeholder="e.g., Protagonist, Antagonist, Supporting"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              placeholder="Physical appearance, personality, background..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Character Arc"
              placeholder="How does this character change throughout the story?"
              value={formData.arc}
              onChange={(e) => setFormData({ ...formData, arc: e.target.value })}
            />

            <Box>
              <Box className="flex gap-2 mb-2">
                <TextField
                  fullWidth
                  label="Add Trait"
                  value={traitInput}
                  onChange={(e) => setTraitInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTrait();
                    }
                  }}
                  size="small"
                />
                <Button variant="outlined" onClick={addTrait}>
                  Add
                </Button>
              </Box>
              <Box className="flex flex-wrap gap-1">
                {formData.traits.map((trait, idx) => (
                  <Chip
                    key={idx}
                    label={trait}
                    size="small"
                    onDelete={() => removeTrait(trait)}
                  />
                ))}
              </Box>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Appears in Chapters</InputLabel>
              <Select
                multiple
                value={formData.appearances}
                onChange={handleAppearancesChange}
                input={<OutlinedInput label="Appears in Chapters" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const chapter = chapters.find(ch => ch.id === value);
                      return (
                        <Chip key={value} label={chapter?.title || 'Unknown'} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {chapters.map((chapter) => (
                  <MenuItem key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveCharacter} variant="contained">
            {editingCharacter ? 'Save Changes' : 'Add Character'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
