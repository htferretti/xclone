import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { HeartFill, Send } from "react-bootstrap-icons"

import api from "../api"
import { colors } from "../style"
import { useAuth } from "../context/AuthContext"
import { formatDateTime } from "../utils/date"
import { resolveProfilePicture } from "../utils/profile"
import { DEFAULT_PROFILE_PICTURE } from "../constants"

const PostContainer = styled.div`
    padding: 16px 0;
    border-bottom: 1px solid ${colors.grayPink};
`

const PostUser = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    gap: 8px;
`

const UserImage = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
    
    &:hover {
        opacity: 0.8;
    }
`

const PostTile = styled.h2`
    color: ${colors.white};
    font-size: 18px;
`

const PostContent = styled.p`
    color: ${colors.white};
    font-size: 14px;
    margin-bottom: 8px;
`

const PostFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
`

const PostDate = styled.span`
    color: ${colors.grayPink};
    font-size: 12px;
`

const PostLike = styled.button<{ logged?: boolean }>`
    color: ${colors.white};
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: none;

    svg {
        font-size: 16px;
    }

    ${({ logged }) => logged && `
        cursor: pointer;

        &:hover svg, &.liked svg {
            color: ${colors.pink};
        }
    `}
`

const PostCommentSection = styled.div`
    display: flex;
    padding: 4px;
    gap: 8px;
    min-height: 35px;
    background: ${colors.dark};
    border-radius: 20px;
`

const PostCommentProfilePic = styled.img`
    width: 30px;
    height: 30px;
    object-fit: cover;
    border-radius: 50%;
`

const PostComment = styled.textarea`
    width: 100%;
    font-size: 14px;
    padding-top: 8px;
    background: none;
    outline: none;
    color: ${colors.white};
    resize: none;
    overflow: hidden;
    min-height: 20px;
    max-height: 150px;
`

const PostCommentButton = styled.button`
    height: 100%;
    width: 20px;
    font-size: 20px;
    display: flex;
    margin: 5px 8px 0 0;
    justify-content: end;
    background: transparent;
    border: none;
    color: ${colors.white};
    align-items: center;
    cursor: pointer;

    &:hover {
        color: ${colors.pink};
    }
`

const Comments = styled.div`
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
`

const Comment = styled.p<{ $clamped?: boolean }>`
    color: ${colors.grayPink};
    font-size: 14px;
    ${({ $clamped }) => $clamped && `
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        position: relative;
    `}

    span {
        color: ${colors.white};
        cursor: pointer;
        
        &:hover {
            color: ${colors.pink};
            text-decoration: underline;
        }
    }
`

const ShowMore = styled.a`
    color: ${colors.grayPink};
    font-size: 12px;
    cursor: pointer;
    display: block;
    text-align: right;

    &:hover {
        text-decoration: underline;
    }
`

type Props = {
    id?: number;
    title: string;
    content: string;
    author_username?: string;
    author_pic?: string;
    published_at?: string;
    like_count?: number;
    is_liked?: boolean;
    onUnlike?: (id: number) => void;
}


const Post = ({ id, title, content, author_username, author_pic, published_at, like_count = 0, is_liked = false, onUnlike }: Props) => {
    const navigate = useNavigate()
    const [liked, setLiked] = useState(is_liked)
    const [likeCount, setLikeCount] = useState(like_count)
    const [liking, setLiking] = useState(false)
    const { isAuthenticated, profilePicture } = useAuth()

    // Comments logic
    const [comments, setComments] = useState<any[]>([])
    const [commentInput, setCommentInput] = useState("")
    const [loadingComments, setLoadingComments] = useState(false)
    const [posting, setPosting] = useState(false)
    const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set())
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Check if user is logged in
    const [isLogged, setIsLogged] = useState(false)
    const [currentUserProfilePic, setCurrentUserProfilePic] = useState("")
    
    useEffect(() => {
        setIsLogged(isAuthenticated)
        if (isAuthenticated) {
            setCurrentUserProfilePic(resolveProfilePicture(profilePicture))
        }
    }, [isAuthenticated, profilePicture])

    useEffect(() => {
        if (!id) return;
        setLoadingComments(true);
        api.get(`posts/${id}/comments/`)
            .then(res => setComments(res.data))
            .catch(() => setComments([]))
            .finally(() => setLoadingComments(false));
    }, [id]);

    const handleComment = async () => {
        if (!commentInput.trim() || !id) return;
        setPosting(true);
        try {
            const res = await api.post(`posts/${id}/comments/`, { content: commentInput });
            setComments([...comments, res.data]);
            setCommentInput("");
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (err) {
            alert("Erro ao comentar");
        }
        setPosting(false);
    };

    const handleCommentInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCommentInput(e.target.value);
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const isCommentLong = (content: string) => {
        // Estimate if comment is longer than 2 lines (assuming ~50 chars per line)
        return content.length > 100;
    };

    const toggleCommentExpansion = (commentId: number) => {
        setExpandedComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId);
            } else {
                newSet.add(commentId);
            }
            return newSet;
        });
    };

    const handleUserClick = () => {
        if (author_username) {
            navigate(`/${author_username}`)
        }
    }

    const handleLike = async () => {
        if (liking || !id || !isLogged) return
        setLiking(true)

        try {
            if (liked) {
                // Unlike
                await api.post(`posts/${id}/unlike/`)
                setLiked(false)
                setLikeCount(Math.max(0, likeCount - 1))
                if (onUnlike) {
                    onUnlike(id)
                }
            } else {
                // Like
                await api.post(`posts/${id}/like/`)
                setLiked(true)
                setLikeCount(likeCount + 1)
            }
        } catch (err: any) {
            // Silently fail
        } finally {
            setLiking(false)
        }
    }

    const profilePictureUrl = resolveProfilePicture(author_pic || DEFAULT_PROFILE_PICTURE)

    return (
        <PostContainer>
            <PostUser>
                <UserImage src={profilePictureUrl} alt={author_username} onClick={handleUserClick} />
                <PostTile>{title}</PostTile>
            </PostUser>
            <PostContent>{content}</PostContent>
            <PostFooter>
                <PostDate>{published_at && <span>Publicado {formatDateTime(published_at)}</span>}</PostDate>
                <PostLike className={liked ? 'liked' : ''} onClick={handleLike} disabled={liking || !isLogged} logged={isLogged}>
                    {likeCount} <HeartFill /> 
                </PostLike>
            </PostFooter>
            {isLogged && (
                <PostCommentSection>
                    <PostCommentProfilePic src={currentUserProfilePic} alt="Your profile" />
                    <PostComment
                        ref={textareaRef}
                        value={commentInput}
                        onChange={handleCommentInputChange}
                        placeholder="Deixe um comentário..."
                        disabled={posting}
                        rows={1}
                    />
                    <PostCommentButton
                        onClick={handleComment}
                        disabled={posting || !commentInput.trim()}
                    >
                        <Send />
                    </PostCommentButton>
                </PostCommentSection>
            )}
            <Comments style={{ marginTop: 10 }}>
                {loadingComments ? (
                    <span style={{ color: colors.grayPink }}>Carregando comentários...</span>
                ) : (
                    comments.length > 0 ? (
                        comments.map(c => {
                            const isExpanded = expandedComments.has(c.id);
                            const needsTruncation = isCommentLong(c.content);
                            return (
                                <div key={c.id}>
                                    <Comment $clamped={needsTruncation && !isExpanded}>
                                        <span onClick={() => navigate(`/${c.author_username}`)}>{c.author_username}:</span> {c.content}
                                    </Comment>
                                    {needsTruncation && (
                                        <ShowMore onClick={() => toggleCommentExpansion(c.id)}>
                                            {isExpanded ? 'mostrar menos' : 'mostrar tudo'}
                                        </ShowMore>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <span style={{ color: colors.grayPink }}>Nenhum comentário ainda.</span>
                    )
                )}
            </Comments>
        </PostContainer>
    )
}

export default Post
