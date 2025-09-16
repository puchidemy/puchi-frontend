import Page404 from "@/components/sys-page/404";

export const metadata = {
  title: "404 - Not Found",
  description: "The page you are looking for does not exist.",
};

const PageAppNotFound = () => {
  return (
    <html>
      <head>
        <style>{`
          body {
            margin: 0;
            padding: 0;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            text-align: center;
          }
          .container {
            padding: 16px;
          }
          .image {
            width: 28rem;
            height: auto;
            margin-bottom: 1.5rem;
            animation: bounce 2s infinite;
          }
          h1 {
            font-size: 2rem;
            font-weight: bold;
            color: #1F2937;
            margin-bottom: 0.5rem;
          }
          p {
            font-size: 1.125rem;
            color: #6B7280;
            margin-bottom: 1.5rem;
          }
          .countdown {
            font-size: 1rem;
            color: #6B7280;
            margin-bottom: 1rem;
          }
          .button {
            padding: 0.5rem 1.25rem;
            font-size: 1rem;
            background-color: #3B82F6;
            color: white;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .button:hover {
            background-color: #2563EB;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </head>
      <body>
        <Page404 />
      </body>
    </html>
  );
};

export default PageAppNotFound;
