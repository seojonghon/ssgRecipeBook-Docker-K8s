import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function Post() {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);  // 댓글 데이터를 관리할 상태 변수 추가
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios(`https://rest-recipe-book-dptb.run.goorm.site/posts/${id}`);
            setPost(result.data.post);  // post 키를 통해 데이터에 접근
            setComments(result.data.comments);  // comments 키를 통해 데이터에 접근
        }
        fetchData();
    }, [id]);

    // 데이터를 불러오는 동안 로딩 메시지 표시
    if (!post) return <div>Loading...</div>;

    return (
        <div>
            <h1>제목 {post.title}</h1>
            <p>유저 아이디{post.user_id}</p>
            <p>내용{post.content}</p>
            <p>생성날짜{post.create_date}</p>
            <p>좋아요 수{post.like}</p>
            <p>수정 날짜{post.modify_date}</p>
            <p>가격 {post.price}</p>

            <h2>댓글</h2>
            {comments.map((comment, index) => (  // 댓글 데이터 렌더링
                <div key={index}>
                    <p>댓글 내용{comment.content}</p> 
                    <p>댓글 작성자 id{comment.user_id}</p> 
                    <p>생성날짜{comment.create_date}</p>
                    <p>좋아요 수{comment.like}</p>
                    <p>{comment.id}</p>
                </div>
            ))}
        </div>
    );
}

export default Post;
