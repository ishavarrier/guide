import { useState } from 'react';
import { ArrowLeft, MapPin, ThumbsUp, ThumbsDown, Send, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { successHaptic, lightHaptic } from '../utils/haptics';

interface Vote {
  userId: string;
  userName: string;
  status: 'confirmed' | 'denied' | 'suggested';
  suggestion?: string;
  timestamp: string;
}

interface SharePollPageProps {
  onBack: () => void;
}

export function SharePollPage({ onBack }: SharePollPageProps) {
  const [votes, setVotes] = useState<Vote[]>([
    {
      userId: '1',
      userName: 'Sarah Johnson',
      status: 'confirmed',
      timestamp: '2 mins ago'
    },
    {
      userId: '2',
      userName: 'Mike Chen',
      status: 'suggested',
      suggestion: 'How about The Oak Restaurant instead? It\'s closer to me.',
      timestamp: '5 mins ago'
    },
    {
      userId: '3',
      userName: 'Emma Davis',
      status: 'confirmed',
      timestamp: '7 mins ago'
    }
  ]);

  const [myVote, setMyVote] = useState<'confirmed' | 'denied' | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);

  const handleVote = (vote: 'confirmed' | 'denied') => {
    if (vote === 'confirmed') {
      successHaptic();
    } else {
      lightHaptic();
    }
    setMyVote(vote);
    if (vote === 'confirmed') {
      setShowSuggestion(false);
      setSuggestion('');
    }
  };

  const handleSuggest = () => {
    setShowSuggestion(true);
    setMyVote(null);
  };

  const handleSubmitSuggestion = () => {
    if (suggestion.trim()) {
      lightHaptic();
      // In real app, would submit the suggestion
      setMyVote('denied');
    }
  };

  const confirmedCount = votes.filter(v => v.status === 'confirmed').length + (myVote === 'confirmed' ? 1 : 0);
  const totalParticipants = votes.length + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden border-2 border-secondary/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-6 pb-8">
          <button
            onClick={onBack}
            className="mb-4 p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl">Confirm Midpoint</h1>
              <p className="text-primary-foreground/80 text-sm">Vote or suggest alternatives</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Midpoint Location Card */}
          <Card className="mb-6 border-2 border-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-secondary/10 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3>The Garden Bistro</h3>
                  <p className="text-sm text-muted-foreground">123 Main St, Downtown</p>
                  <p className="text-sm text-secondary mt-1">Midpoint location</p>
                </div>
              </div>
              
              {/* Vote Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Group confirmation</span>
                  <span className="text-secondary">{confirmedCount}/{totalParticipants} confirmed</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary rounded-full h-2 transition-all"
                    style={{ width: `${(confirmedCount / totalParticipants) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Response */}
          {!myVote && !showSuggestion && (
            <div className="mb-6">
              <h3 className="mb-3 text-secondary">Your Response</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleVote('confirmed')}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>Confirm</span>
                </Button>
                <Button
                  onClick={handleSuggest}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Suggest New</span>
                </Button>
              </div>
            </div>
          )}

          {/* Vote Confirmed */}
          {myVote === 'confirmed' && (
            <Card className="mb-6 border-2 border-secondary">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 p-2 rounded-lg">
                    <ThumbsUp className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-secondary">You confirmed this location</p>
                    <p className="text-sm text-muted-foreground">Waiting for others to respond</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMyVote(null)}
                  >
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestion Form */}
          {showSuggestion && (
            <Card className="mb-6">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3>Suggest Alternative</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowSuggestion(false);
                      setSuggestion('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <Textarea
                  placeholder="Suggest a different location or time..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
                <Button
                  onClick={handleSubmitSuggestion}
                  className="w-full"
                  disabled={!suggestion.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Suggestion
                </Button>
              </CardContent>
            </Card>
          )}

          <Separator className="mb-6" />

          {/* Group Responses */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            <h3 className="sticky top-0 bg-background pb-2 z-10">Group Responses</h3>
            
            {votes.map((vote) => (
              <Card key={vote.userId}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {vote.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{vote.userName}</span>
                        {vote.status === 'confirmed' && (
                          <Badge variant="default" className="bg-primary">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            Confirmed
                          </Badge>
                        )}
                        {vote.status === 'denied' && (
                          <Badge variant="destructive">
                            <ThumbsDown className="w-3 h-3 mr-1" />
                            Denied
                          </Badge>
                        )}
                        {vote.status === 'suggested' && (
                          <Badge variant="secondary">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Suggested
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{vote.timestamp}</p>
                      {vote.suggestion && (
                        <p className="text-sm bg-muted p-2 rounded-lg">{vote.suggestion}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
