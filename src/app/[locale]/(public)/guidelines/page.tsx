import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";

const GuidelinesPage = () => {
  return (
    <div className="container my-8 font-din">
      <Card className="p-0 md:p-10">
        <CardHeader>
          <CardTitle className="mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Community Guidelines
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-none text-[18px] space-y-4">
            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Puchi is a global community of language learners
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300 mb-4">
                We believe that everyone should have access to free language
                education. Our guidelines are meant to build a mutual
                understanding of what being a part of this community is all
                about. We will take action if any of these guidelines are not
                upheld, so please read carefully.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Always be Respectful
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                We come together from across the world at varying language
                levels with the same goal in mind - to learn. Curiosity,
                questioning, and cultural understanding are something we
                celebrate. Be respectful of others and where they&apos;re coming
                from.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Embrace and share regional language differences
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                A language can have many words, accents and ways to say the same
                thing. We think that&apos;s one of the wonders of languages. Approach
                these conversations with an open mind and attitude.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Help and support across all skill levels
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                We care about your safety. Speaking another language is
                inherently social, but please beware of swapping or posting any
                private information that could be misused. That includes your
                phone number, age, address, what time you&apos;ll be at home, school
                name, email, or other personal information that could put your
                privacy at risk. Simply put: don&apos;t over-share. Sharing and
                encouraging others to share personal data might get your post,
                and possibly your account, removed.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Think before you share
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                We are all in this together. Learning a language is hard and
                takes a lot of courage and dedication. If someone uses incorrect
                grammar or has a question you think has an obvious answer,
                kindly and calmly help them out. Heckling and being straight up
                mean doesn&apos;t help anyone learn. Can&apos;t say it nicely? Don&apos;t weigh
                in.
              </p>
            </li>
          </ol>
        </CardContent>

        <Separator />

        <CardHeader>
          <CardTitle className="mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Please don&apos;t use Puchi to...
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-none text-[18px] space-y-4">
            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Attack a person or group of people with words and actions
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300 mb-4">
                Puchi is a safe place for learners of all backgrounds.
                Harassment and hurtful content will not be tolerated. Using
                symbols, names and text that promote hate-as well as harassing,
                stalking, impersonating, and making sexual remarks towards
                someone-are considered abuse. The same goes for nudity and
                disturbing profile pictures and usernames. As stated in the{" "}
                <Link
                  href="/terms"
                  className="text-blue-500 font-bold underline underline-offset-1"
                >
                  terms
                </Link>
                , Puchi reserves the right to replace images or remove these
                accounts at its sole discretion. Rule of thumb: if you are
                making someone feel attacked or hurt, then you shouldn&apos;t be
                doing it. We take these reports seriously and may delete your
                account without previous notice if such activity is verified by
                our team.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Script or cheat maliciously
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                Puchi believes in honest learning. If you are scripting for the
                purposes of cheating or sharing information and instructions
                about using Puchi in a way that may impact the system,
                community, learning, data or experience in a negative or
                significant manner, your account and posts may be removed.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Write inflammatory comments
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                Hateful, obscene and off-topic comments don&apos;t contribute to
                learning. Cursing doesn&apos;t either (let people discover those
                words in the wild). Leave them out of the language discussions.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                To Summarize
              </h3>
              <div className="text-justify text-gray-700 dark:text-gray-300">
                We do not tolerate content that is:
                <ol className="list-disc ml-6 mt-2">
                  <li>Illega</li>
                  <li>Pornographic</li>
                  <li>Excessively profane or violent</li>
                  <li>Spam</li>
                  <li>Threatening, harassing, or bullying</li>
                  <li>Associated with racism or intolerance</li>
                  <li>
                    Impersonating someone in a misleading or deceptive manner
                  </li>
                  <li>Personal confidential information</li>
                </ol>
              </div>
            </li>
          </ol>
        </CardContent>
        <CardFooter>
          <p className="text-justify text-gray-700 dark:text-gray-300">
            Please don&apos;t waste your time looking for loopholes; we will remove
            any content that violates the spirit of these guidelines and you
            will risk losing partial or full access to Puchi without warning. By
            following these guidelines, we will all contribute to an interesting
            and helpful learning community.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GuidelinesPage;
