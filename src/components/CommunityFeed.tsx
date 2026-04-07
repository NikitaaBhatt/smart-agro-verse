import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { communityAPI, Post } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Heart, MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const CommunityFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const feed = await communityAPI.getFeed();
      setPosts(feed);
    } catch (error: any) {
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await communityAPI.createPost(user.token, {
        content: newPostContent,
        image_url: newPostImage || undefined,
      });
      toast.success("Post created successfully!");
      setNewPostContent("");
      setNewPostImage("");
      loadFeed();
    } catch (error: any) {
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!user) return;
    try {
      await communityAPI.likePost(user.token, postId);
      loadFeed();
    } catch (error: any) {
      toast.error("Failed to like post");
    }
  };

  const handleComment = async (postId: number) => {
    if (!user || !commentInputs[postId]?.trim()) return;
    
    try {
      await communityAPI.commentOnPost(user.token, postId, {
        content: commentInputs[postId],
      });
      setCommentInputs({ ...commentInputs, [postId]: "" });
      loadFeed();
      toast.success("Comment added!");
    } catch (error: any) {
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Share with Community</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="image_url">Image URL (optional)</Label>
              <Input
                id="image_url"
                type="url"
                value={newPostImage}
                onChange={(e) => setNewPostImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <Button type="submit" className="w-full gradient-blockchain shadow-glow" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Feed */}
      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="pt-6 text-center text-muted-foreground">
            No posts yet. Be the first to share!
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="shadow-card">
            <CardContent className="pt-6">
              {/* Post Header */}
              <div className="flex items-start gap-3 mb-4">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {post.author_type === "farmer" ? "F" : "B"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">
                    {post.author_name || `${post.author_type === "farmer" ? "Farmer" : "Buyer"} #${post.author_id}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="Post"
                  className="rounded-lg w-full max-h-96 object-cover mb-4"
                />
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className="gap-2"
                >
                  <Heart className="w-4 h-4" />
                  {post.like_count}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {post.comments.length}
                </Button>
              </div>

              {/* Comments */}
              {post.comments.length > 0 && (
                <div className="space-y-3 mb-4 border-t pt-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-muted">
                          {comment.author_type === "farmer" ? "F" : "B"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium text-foreground">
                            {comment.author_name || `${comment.author_type === "farmer" ? "Farmer" : "Buyer"} #${comment.author_id}`}
                          </span>
                          <span className="text-muted-foreground ml-2 text-xs">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </p>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentInputs[post.id] || ""}
                  onChange={(e) =>
                    setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleComment(post.id);
                    }
                  }}
                />
                <Button size="sm" onClick={() => handleComment(post.id)}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
